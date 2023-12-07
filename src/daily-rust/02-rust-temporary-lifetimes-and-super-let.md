# (译)Rust临时生命周期和"Super Let"

原文: [Rust Temporary Lifetimes and "Super Let"](https://blog.m-ou.se/super-let/)

在Rust中, 临时变量生命周期是一个复杂但又经常被忽视的话题. 在一些简单的情况下, Rust会让临时变量存活足够长的时间, 这样我们就不必考虑它们了. 然而, 在很多情况下, 我们可能无法立即得到我们想要的东西.

在这篇文章中, 我们将(重新)发现临时变量生命周期的规则, 介绍一些临时变量生命周期扩展的用例, 并探索一种新的语言思想--`super let,`, 为我们提供更多控制.

## 临时变量

下面是一条Rust语句, 没有上下文, 使用的是临时`String`:

```rust
f(&String::from('🦀'));
```

这个临时`String`的存活时间多长?如果我们今天设计Rust, 基本上有两种选择:

1. 在调用 `f` 之前, 字符串会被立即丢弃. 或者
2. 只有在调用 `f` 后, 字符串才会被丢弃.

如果我们选择方案**1**, 那么上面的语句将始终导致借用检查错误, 因为我们不能让`f`借用已经消失的东西.
因此, Rust选择了方案**2**: 首先分配字符串, 然后将其引用传递给`f`, 只有在`f`返回后, 我们才会丢弃临时字符串.

### 在一个 `let` 语句中

现在是一个稍难的问题:

```rust
let a = f(&String::from('🦀'));
…
g(&a);
```

再来: 这个临时`String`的存活时间多长?

1. 字符串会在 `let` 语句结束时丢弃: 在`f`返回之后, 但在`g`被调用之前. 或者
2. 字符串会在调用`g`之后的同时`a`被丢弃.

如果`f`被定义为 `fn f(s: &str) -> usize`(如`str::len`), 那么在`let`语句后立即去掉`String`就完全没问题了.

但是, 如果`f`被定义为 `fn f(s: &str) -> &[u8]`(就像 `str::as_bytes`), 那么 `a` 就会从临时变量 `String` 中借用, 因此如果我们将`a`保留较长时间, 就会出现借用检查错误.

如果采用方案**2**, 在这两种情况下都能正常编译, 但我们可能会在超出必要的存活时间内保留一个临时变量, 这可能会浪费资源或导致微妙的错误(例如, 当`MutexGuard`比预期时间晚丢弃时会造成死锁).

这听起来像是第**3**种选择: 让它取决于`f`的签名.

但是, Rust的借用检查器只执行检查, 并不影响代码的行为. 出于各种原因, 这是一个非常重要和有用的属性. 举例来说, 将 `fn f(s:&str)->&[u8]`(返回值借用参数)改为 `fn f(s:&str)->&'static[u8]`(返回值不借用参数)并不会改变调用位置的任何内容, 例如临时变量被丢弃的位置.

因此, 在方案**1**和方案**2**之间, Rust 选择了方案**1**: 在`let`语句末尾删除临时变量. 手动将`String`移到单独的`let`语句中, 让它保持更长的时间也很容易.

```rust
let s = String::from('🦀'); // Moved to its own `let` to give it a longer lifetime.
let a = f(&s);
…
g(&a);
```

### 在嵌套调用中

好吧, 再来一个:

```rust
g(f(&String::from('🦀')));
```

同样, 有两种选择:

1. 在调用`f`之后、调用`g`之前, 字符串被丢弃. 或者
2. 字符串会在语句结束时丢弃, 所以是在调用`g`之后.

该代码段与前一个代码段几乎完全相同: 临时`String`的引用被传递给`f`, `f`的返回值被传递给`g`.

不过, 方案**1**可能有效, 也可能无效, 这取决于`f`的签名, 而方案**2**可能会让临时变量存活更长的时间.

不过, 这次方案**1**会给程序员带来更多惊喜. 例如, 即使是简单的 `String::from('🦀').as_bytes().contains(&0x80)` 也无法编译, 因为字符串会在 `as_bytes(f)` 之后、`contains (g)` 之前被删除.

也可以说, 把临时变量多存活一段时间的坏处要小得多, 因为他们在声明结束时仍然会被丢弃.

因此, Rust选择了方案**2**: 无论`f`的签名如何, 字符串都会一直存在, 直到语句结束, 直到`g`被调用.

### 在一个 `if` 语句中

现在, 我们来看看简单的 `if` 语句:

```rust
if f(&String::from('🦀')) {
    …
}
```

同样的问题: `String` 何时丢弃?

1. 在 `if` 的条件求值之后, 但在 `if` 的主体执行之前(即在`{`处). 或者
2. 在 `if` 主体执行之后(即在`}`处).

在这种情况下, 就没有理由在`if`主体中保留临时值. 条件的结果是一个布尔值(只有`true`或`false`), 顾名思义, 这并不借用任何东西.

因此, Rust选择方案**1**.

例如, 在使用 `Mutex::lock` 时, 它就会返回一个临时`MutexGuard`, 当`Mutex`被丢弃时, 它就会解锁:

```rust
fn example(m: &Mutex<String>) {
    if m.lock().unwrap().is_empty() {
        println!("the string is empty!");
    }
}
```

在这里, `m.lock().unwrap()`中的临时`MutexGuard`会在`.is_empty()`之后丢弃, 这样`Mutex`就不会在`println`语句中被不必要地锁定.

### 在 `if let` 语句中

但 `if let`(和 `match`)的情况有所不同, 因为此时我们的表达式并不一定是评估布尔值:

```rust
if let … = f(&String::from('🦀')) {
    …
}
```

再次, 有两种选择:

1. 在模式匹配之后、`if let` 的正文之前(即 `{` 处)删除字符串. 或者、
2. 在 `if let` 主体之后(即 `}` 处)删除字符串.

这一次, 我们有理由选择方案**2**而不是方案**1**, 在`if let`语句或`match`中借用模式是很常见的.

因此, 在这种情况下, Rust选择了方案**2**.

例如, 如果我们有一个`Mutex<Vec<T>>`类型的`vec`, 编译起来就很好:

```rust
if let Some(x) = vec.lock().unwrap().first() {
    // The mutex is still locked here. :)
    // This is necessary, because we're borrowing `x` from the `Vec`. (`x` is a `&T`)
    println!("first item in vec: {x}");
}
```

我们从`m.lock().unwrap()`获得一个临时的`MutexGuard`, 并使用`.first()`方法借用第一个元素. 由于`MutexGuard`只在最后一个 `}`才被丢弃, 因此借用将持续整个`if let`主体.

不过, 在有些情况下, 这并不是我们想要的. 例如, 如果我们使用`pop`代替`first`, 它返回的是值而不是引用:

```rust
if let Some(x) = vec.lock().unwrap().pop() {
    // The mutex is still locked here. :(
    // This is unnecessary, because we don't borrow anything from the `Vec`. (`x` is a `T`)
    println!("popped item from the vec: {x}");
}
```

这可能会[令人惊讶](https://marabos.nl/atomics/basics.html#lifetime-of-mutexguard), 并导致微妙的错误或性能降低.

也许这就是Rust选择错误方案的一个论据, 也许这就是在未来版本的Rust中改变这一规则的一个论据. 关于如何修改这些规则的想法, 请参阅 [Niko’s blog post on this topic](https://smallcultfollowing.com/babysteps/blog/2023/03/15/temporary-lifetimes/).

目前, 解决方法是使用一个单独的`let` 语句, 将临时生命周期限制在该语句中:

```rust
let x = vec.lock().unwrap().pop(); // The MutexGuard is dropped after this statement.
if let Some(x) = x {
    …
}
```

## 临时生命周期扩展

这种情况如何?

```rust
let a = &String::from('🦀');
…
f(&a);
```

两种选择:

1. 字符串会在 `let` 语句的末尾被丢弃. 或者
2. 在调用 `f` 后, 字符串与 `a` 同时被删除.

方案**1** 总是会导致借用检查错误. 因此, 方案**2**可能更有意义. 如今Rust也确实是这样工作的: 临时生命周期被扩展了, 因此上面的代码段可以正常编译.

这种临时生命周期长于它在声明中出现的时间的现象被称为***临时生命周期扩展***.

临时生命周期扩展并不适用于所有出现在`let`语句中的临时字符串, 正如我们已经看到的那样: `let a = f(&String::from('🦀'))`; 中的临时字符串不会超过 `let`语句的生命周期.

在`let a = &f(&String::from('🦀'))`;(注意多出的 `&`)中, 临时生命周期扩展确实适用于最外层的`&`, 它借用了作为`f` 返回值的临时, 但不适用于内层的`&`, 它借用了`String`.

例如, 用`str::len` 代替`f`:

```rust
let a: &usize = &String::from('a').len();
```

在这里, 字符串在 `let` 语句的末尾被删除, 但 `.len()`返回的`usize`和`a`活的一样长.

这不仅限于 `let _ = &...;` 语法. 例如

```rust
let a = Person {
    name: &String::from('🦀'), // Extended!
    address: &String::from('🦀'), // Extended!
};
```

在上面的代码段中, 临时字符串的生命周期将被扩展, 因为即使我们对 `Person` 类型一无所知, 我们也可以肯定, 生命周期扩展对于生成对象之后的可用性是必要的.

关于 `let` 语句中哪些临时变量的生命周期会被延长, [`temporary lifetime extension in Rust Reference`](https://doc.rust-lang.org/stable/reference/destructors.html#temporary-lifetime-extension)中有详细的说明, 但实际上只适用于那些从语法上就能看出有必要延长生命周期的表达式, 而与任何类型、函数签名或特质实现无关:

```rust
let a = &temporary().field; // Extended!
let a = MyStruct { field: &temporary() }; // Extended!
let a = &MyStruct { field: &temporary() }; // Both extended!
let a = [&temporary()]; // Extended!
let a = { …; &temporary() }; // Extended!

let a = f(&temporary()); // Not extended, because it might not be necessary.
let a = temporary().f(); // Not extended, because it might not be necessary.
let a = temporary() + temporary(); // Not extended, because it might not be necessary.
```

虽然这看起来很合理, 但当我们考虑到构造元组结构或元组变体的语法只是一个函数调用时, 确实会感到意外: 从语法上讲, `Some(123)` 是对函数 `Some` 的函数调用.

例如:

```rust
let a = Some(&temporary()); // Not extended! (Because `Some` could have any signature...)
let a = Some { 0: &temporary() }; // Extended! (I bet you have never used this syntax.)
```

这可能会让人相当困惑.

这也是值得考虑[重新修订规则](https://smallcultfollowing.com/babysteps/blog/2023/03/15/temporary-lifetimes/#design-principles)的原因之一.

### 持续推广

### 代码块中的临时生命周期扩展

### 临时生命周期扩展的限制

### Macros宏

## `super let`

### 用户体验和诊断

### 可能的扩展

## 临时生命周期 2024 RFC

## 反馈
