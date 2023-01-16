# 类型系统: 泛型

## 1. 泛型参数的三种使用场景

- 使用泛型参数延迟数据结构的绑定
- 使用泛型参数和 `PhantomData`, 声明数据结构中不直接使用, 但在实现过程中需要用到的类型.
- 使用泛型参数让同一个数据结构对同一个`trait`可以有不同的实现

### 1.1 泛型参数做延迟绑定

```rust
/// Service 数据结构
pub struct Service<Store = MemTable> {
    inner: Arc<ServiceInner<Store>>,
}
```

它使用了一个泛型参数Store, 并且这个泛型参数有一个缺省值, 在使用时可以不必提供泛型参数, 直接使用缺省值.  这个泛型参数在随后的实现中可以被逐渐约束.

```rust
impl<Store> Service<Store> {
    pub fn new(store: Store) -> Self { ... }
}

impl<Store: Storage> Service<Store> {
    pub fn execute(&self, cmd: CommandRequest) -> CommandResponse { ... }
}
```

### 1.2 使用泛型参数和幽灵数据（PhantomData）提供额外类型

设计一个 User 和 Product 数据结构，它们都有一个 u64 类型的 id。然而我希望每个数据结构的 id 只能和同种类型的 id 比较. 

```rust
use std::marker::PhantomData;

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Identifier<T> {
    inner: u64,
    _tag: PhantomData<T>,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct User {
    id: Identifier<Self>,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Product {
    id: Identifier<Self>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn id_should_not_be_the_same() {
        let user = User::default();
        let product = Product::default();

        // 两个 id 不能比较，因为他们属于不同的类型
        // assert_ne!(user.id, product.id);

        assert_eq!(user.id.inner, product.id.inner);
    }
}
```

让我们可以用 `PhantomData` 来持有 **Phantom Type**。`PhantomData` 中文一般翻译成**幽灵数据**，这名字透着一股让人不敢亲近的邪魅，但它被**广泛用在处理，数据结构定义过程中不需要，但是在实现过程中需要的泛型参数。**

### 1.3 使用泛型参数来提供多个实现

用泛型数据结构来统一相同的逻辑，用泛型参数的具体类型来处理变化的逻辑.

我们写代码的首要目标是正确地实现所需要的功能，在正确性的前提下，优雅简洁的表达才有意义。
