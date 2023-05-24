# 用于处理借用数据的模块: `std::borrow`

## 1 Borrow

```rust
pub trait Borrow<Borrowed>
where
    Borrowed: ?Sized,
{
    // Required method
    fn borrow(&self) -> &Borrowed;
}
```

一个用于借用数据的`trait`.  
通过实现`Borrow<T>`来表达它们可以作为其个类型`T`借出.并在`trait`的`borrow`方法中提供对`T`的引用.  
例如: `String`实现了`Borrow<str>`,则可以作为`str`进行借出, `Box<T>`实现了`Borrow<T>`,则可以作为`T`进行借出

## 2. BorrowMut

```rust
pub trait BorrowMut<Borrowed>: Borrow<Borrowed>
where
    Borrowed: ?Sized,
{
    // Required method
    fn borrow_mut(&mut self) -> &mut Borrowed;
}
```

一个用于可变借用数据的`trait`.  
作为`Borrow<T>`的补充，该`trait`允许类型通过提供可变引用来借用底层类型.

## 3. ToOwned

```rust
pub trait ToOwned {
    type Owned: Borrow<Self>;

    // Required method
    fn to_owned(&self) -> Self::Owned;

    // Provided method
    fn clone_into(&self, target: &mut Self::Owned) { ... }
}
```

`Clone`在借用数据上的泛化.
`Clone`一般是`&T`到`T`, `ToOwned` trait 将`Clone`泛化, 可以从给定类型的任何借用中构造拥有数据.

这里关联类型`Owned`需要满足`Borrow<Self>` trait, 此处`Self`为要实现`ToOwned`的结构.
看下 [str对ToOwned trait 的实现](https://doc.rust-lang.org/src/alloc/str.rs.html#203-217):

```rust
impl ToOwned for str {
    type Owned = String

    // Required method
    fn to_owned(&self) -> Self::Owned { ... }

    // Provided method
    fn clone_into(&self, target: &mut Self::Owned) { ... }
}
```

关联类型`Owned`被定义为`String`, 而根据要求，`String`必须定义`Borrow<T>`，那这里`Borrow`里的泛型变量`T`是谁呢?  
`ToOwned`要求是`Borrow<Self>`，而此刻实现 `ToOwned` 的主体是 `str`，所以 `Borrow<Self>` 是 `Borrow<str>`, 而`String`的确实现了`Borrow<str>`.

## 4. Cow

```rust
pub enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
{
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

`Cow`用于提供写时克隆（Clone-on-Write）的一个智能指针,**包裹一个只读借用，但如果调用者需要所有权或者需要修改内容，那么它会 clone 借用的数据.**

`Cow`实现了[Deref trait](https://doc.rust-lang.org/src/alloc/borrow.rs.html#332-341).

```rust
impl<B: ?Sized + ToOwned> Deref for Cow<'_, B> {
    type Target = B;

    fn deref(&self) -> &B {
        match *self {
            Borrowed(borrowed) => borrowed,
            Owned(ref owned) => owned.borrow(),
        }
    }
}
```
