# handler 原理

## 1.1 剖析

在 `actix-web` 中，路由设置 [handler](https://docs.rs/actix-web/latest/actix_web/struct.Route.html#method.to) 的方法 定义如下：

```rust
pub fn to<F, Args>(self, handler: F) -> Self
where
    F: Handler<Args>,
    Args: FromRequest + 'static,
    F::Output: Responder + 'static,
{
    self.service = handler_service(handler);
    self
}
```

参数`handler`的约束为`Handler<Args>`, 其定义如下:

```rust
pub trait Handler<Args>: Clone + 'static {
    type Output;
    type Future: Future<Output = Self::Output>;

    fn call(&self, args: Args) -> Self::Future;
}
```

这里的`Args`就代表n个参数.

结合这两个来看, `to`函数中`Handler<Args>`的`Args`需要实现`FromRequest` trait 就可以作为参数, 而`Handler<Args>`的关联类型`Output`需要实现`Responder` trait.

但是`Args`是如何实现动态参数的呢, 来看下`to`函数的`handler_service`方法:

```rust
pub(crate) fn handler_service<F, Args>(handler: F) -> BoxedHttpServiceFactory
where
    F: Handler<Args>,
    Args: FromRequest,
    F::Output: Responder,
{
    boxed::factory(fn_service(move |req: ServiceRequest| {
        let handler = handler.clone();

        async move {
            let (req, mut payload) = req.into_parts();

            let res = match Args::from_request(&req, &mut payload).await {
                Err(err) => HttpResponse::from_error(err),

                Ok(data) => handler
                    .call(data)
                    .await
                    .respond_to(&req)
                    .map_into_boxed_body(),
            };

            Ok(ServiceResponse::new(req, res))
        }
    }))
}
```

这里的`handler`的约束和上而的`to`区别不大,看下里面的实现,同上面所说`Args`只需要实现`FromRequest`就可以拿来做参数, 换句话说, 实现了 `FromRequest` 你可以在 `Handle` 方法中的任意参数位置写上你要的参数名和类型.
通过`Args::FromRequest`提取出参数,就调用`handler.call`方法执行你的接口, 如何失败则返回`FromRequest`中定义的Error, 所以你可以随意定义参数提取失败之后返回的内容.
但是问题来了, `Args`如何实现支持多个参数, 在源码里找到以下定义:

```rust
macro_rules! tuple_from_req {
        ($fut: ident; $($T: ident),*) => {
            /// FromRequest implementation for tuple
            #[allow(unused_parens)]
            impl<$($T: FromRequest + 'static),+> FromRequest for ($($T,)+)
            {
                type Error = Error;
                type Future = $fut<$($T),+>;

                fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
                    $fut {
                        $(
                            $T: ExtractFuture::Future {
                                fut: $T::from_request(req, payload)
                            },
                        )+
                    }
                }
            }

            pin_project! {
                pub struct $fut<$($T: FromRequest),+> {
                    $(
                        #[pin]
                        $T: ExtractFuture<$T::Future, $T>,
                    )+
                }
            }

            impl<$($T: FromRequest),+> Future for $fut<$($T),+>
            {
                type Output = Result<($($T,)+), Error>;

                fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
                    let mut this = self.project();

                    let mut ready = true;
                    $(
                        match this.$T.as_mut().project() {
                            ExtractProj::Future { fut } => match fut.poll(cx) {
                                Poll::Ready(Ok(output)) => {
                                    let _ = this.$T.as_mut().project_replace(ExtractFuture::Done { output });
                                },
                                Poll::Ready(Err(e)) => return Poll::Ready(Err(e.into())),
                                Poll::Pending => ready = false,
                            },
                            ExtractProj::Done { .. } => {},
                            ExtractProj::Empty => unreachable!("FromRequest polled after finished"),
                        }
                    )+

                    if ready {
                        Poll::Ready(Ok(
                            ($(
                                match this.$T.project_replace(ExtractFuture::Empty) {
                                    ExtractReplaceProj::Done { output } => output,
                                    _ => unreachable!("FromRequest polled after finished"),
                                },
                            )+)
                        ))
                    } else {
                        Poll::Pending
                    }
                }
            }
        };
    }


    impl FromRequest for () {
        type Error = Infallible;
        type Future = Ready<Result<Self, Self::Error>>;

        fn from_request(_: &HttpRequest, _: &mut Payload) -> Self::Future {
            ok(())
        }
    }

    tuple_from_req! { TupleFromRequest1; A }
    tuple_from_req! { TupleFromRequest2; A, B }
    tuple_from_req! { TupleFromRequest3; A, B, C }
    tuple_from_req! { TupleFromRequest4; A, B, C, D }
    tuple_from_req! { TupleFromRequest5; A, B, C, D, E }
    tuple_from_req! { TupleFromRequest6; A, B, C, D, E, F }
    tuple_from_req! { TupleFromRequest7; A, B, C, D, E, F, G }
    tuple_from_req! { TupleFromRequest8; A, B, C, D, E, F, G, H }
    tuple_from_req! { TupleFromRequest9; A, B, C, D, E, F, G, H, I }
    tuple_from_req! { TupleFromRequest10; A, B, C, D, E, F, G, H, I, J }
    tuple_from_req! { TupleFromRequest11; A, B, C, D, E, F, G, H, I, J, K }
    tuple_from_req! { TupleFromRequest12; A, B, C, D, E, F, G, H, I, J, K, L }

```

这里把`Args`的一堆 `tuple`, `()`,`A`,`A, B`...都实现了,所以在 `handler_service` 里的 `Args` 实际上是一个 `tuple`,并在里面逐个调用参数的`from_request`, 接口的参数限制最多12个, 当超过12个参数时就会报错. 这就回答了上面`Args`支持多个参数.

这里又出新了一个新的问题, 参数解析出来了, 但是 `handler.call(data)`如何支持多个参数, 看实现, [`Handler<Args>`](https://docs.rs/actix-web/latest/src/actix_web/handler.rs.html#116) 给`fn`各种长度参数`fn() -> R`, `fn(A, B, C) -> R` 实现了最多12个参数.

```rust
/// Generates a [`Handler`] trait impl for N-ary functions where N is specified with a sequence of
/// space separated type parameters.
///
/// # Examples
/// ```ignore
/// factory_tuple! {}         // implements Handler for types: fn() -> R
/// factory_tuple! { A B C }  // implements Handler for types: fn(A, B, C) -> R
/// ```
macro_rules! factory_tuple ({ $($param:ident)* } => {
    impl<Func, Fut, $($param,)*> Handler<($($param,)*)> for Func
    where
        Func: Fn($($param),*) -> Fut + Clone + 'static,
        Fut: Future,
    {
        type Output = Fut::Output;
        type Future = Fut;

        #[inline]
        #[allow(non_snake_case)]
        fn call(&self, ($($param,)*): ($($param,)*)) -> Self::Future {
            (self)($($param,)*)
        }
    }
});

factory_tuple! {}
factory_tuple! { A }
factory_tuple! { A B }
factory_tuple! { A B C }
factory_tuple! { A B C D }
factory_tuple! { A B C D E }
factory_tuple! { A B C D E F }
factory_tuple! { A B C D E F G }
factory_tuple! { A B C D E F G H }
factory_tuple! { A B C D E F G H I }
factory_tuple! { A B C D E F G H I J }
factory_tuple! { A B C D E F G H I J K }
factory_tuple! { A B C D E F G H I J K L }
```

## 1.2 总结
