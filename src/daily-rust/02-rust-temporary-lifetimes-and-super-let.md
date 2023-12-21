# (译)Rust临时生命周期和"Super Let"

原文[^1]: [Rust Temporary Lifetimes and "Super Let"](https://blog.m-ou.se/super-let/)

在`Rust`中, 临时变量生命周期是一个复杂但又经常被忽视的话题. 在一些简单的情况下, `Rust`会让临时变量存活足够长的时间, 这样我们就不必考虑它们了. 然而, 在很多情况下, 我们可能无法立即得到我们想要的东西.

在这篇文章中, 我们将(重新)发掘临时变量生命周期的规则, 介绍一些临时变量生命周期扩展的用例, 并探索一种新的语言理念--`super let,`, 为我们提供更多控制.

## 临时变量

下面是一条`Rust`语句, 没有上下文, 使用的是临时`String`:

```rust
f(&String::from('🦀'));
```

这个临时`String`的存活时间多长?如果我们今天设计`Rust`, 基本上有两种选择:

1. 在调用 `f` 之前, 字符串会被立即丢弃. 或者
2. 只有在调用 `f` 后, 字符串才会被丢弃.

如果我们选择方案**1**, 那么上面的语句将始终导致借用检查错误, 因为我们不能让`f`借用已经消失的东西.
因此, `Rust`选择了方案**2**: 首先分配字符串, 然后将其引用传递给`f`, 只有在`f`返回后, 我们才会丢弃临时字符串.

### 在一个 `let` 语句中

现在是一个稍难的问题:

```rust
let a = f(&String::from('🦀'));
…
g(&a);
```

再来: 这个临时`String`的存活时间多长?

1. 字符串会在 `let` 语句结束时丢弃: 即在`f`返回之后, 但在`g`被调用之前. 或者
2. 字符串会在调用`g`之后的同时`a`被丢弃.

如果`f`被定义为 `fn f(s: &str) -> usize`(如`str::len`), 那么在`let`语句后立即去掉`String`就完全没问题了.

但是, 如果`f`被定义为 `fn f(s: &str) -> &[u8]`(就像 `str::as_bytes`), 那么 `a` 就会从临时变量 `String` 中借用, 因此如果我们将`a`保留较长时间, 就会出现借用检查错误.

如果采用方案**2**, 在这两种情况下都能正常编译, 但我们可能会在超出必要的存活时间内保留一个临时变量, 这可能会浪费资源或导致微妙的错误(例如, 当`MutexGuard`比预期时间晚丢弃时会造成死锁).

这听起来像是第**3**种选择: 让它取决于`f`的签名.

但是, `Rust`的借用检查器只执行检查, 并不影响代码的行为. 出于各种原因, 这是一个非常重要和有用的属性. 举例来说, 将 `fn f(s:&str)->&[u8]`(返回值借用参数)改为 `fn f(s:&str)->&'static[u8]`(返回值不借用参数)并不会改变调用位置的任何内容, 例如临时变量被丢弃的位置.

因此, 在方案**1**和方案**2**之间, `Rust`选择了方案**1**: 在`let`语句末尾删除临时变量. 很容易手动将`String`移到单独的`let`语句中, 让它保持更长的时间.

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

因此, `Rust`选择方案**1**.

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

也许这就是`Rust`选择错误方案的一个论据, 也许这就是在未来版本的`Rust`中改变这一规则的一个论据. 关于如何修改这些规则的想法, 请参阅 [Niko’s blog post on this topic](https://smallcultfollowing.com/babysteps/blog/2023/03/15/temporary-lifetimes/).

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

方案**1** 总是会导致借用检查错误. 因此, 方案**2**可能更有意义. 如今`Rust`也确实是这样工作的: 临时生命周期被扩展了, 因此上面的代码段可以正常编译.

这种临时变量生命周期长于它在声明中出现的时间的现象被称为**临时生命周期扩展**.

临时生命周期扩展并不适用于***所有***出现在`let`语句中的临时字符串, 正如我们已经看到的那样: `let a = f(&String::from('🦀'))`; 中的临时字符串不会超过 `let`语句的生命周期.

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

想象一下, 我们有某种`Writer`类型, 它持有一个要写入的文件的引用:

```rust
pub struct Writer<'a> {
    pub file: &'a File
}
```

以下代码创建了`Writer`, 写入新创建的文件:

```rust
println!("opening file...");
let filename = "hello.txt";
let file = File::create(filename).unwrap();
let writer = Writer { file: &file };
```

现在的作用域包含`filename`、`file`和`writer`. 然而, 后面的代码只能通过
`Writer`写入. 理想的情况是, 在作用域中已经看不到`filename`, 尤其是`file`.

由于临时生命周期扩展也适用于代码块的最终表达式, 因此我们可以通过以下方式来实现:

```rust
let writer = {
    println!("opening file...");
    let filename = "hello.txt";
    Writer { file: &File::create(filename).unwrap() }
};
```

现在, `Writer`的创建被整齐地封装在它自己的作用域中, 这样外层作用域只能看到 `writer`, 而看不到其他任何东西.得益于临时生命周期的扩展, 在内作用域中作为临时创建的`file`与 `writer` 一样的存活时间.

### 临时生命周期扩展的限制

试想一下, 如果我们将`Writer`结构中的`file`字段设置为私有, 会是怎样的结果？

```rust
pub struct Writer<'a> {
    file: &'a File
}

impl<'a> Writer<'a> {
    pub fn new(file: &'a File) -> Self {
        Self { file }
    }
}
```

这样, 我们就不需要对原始用法片段做太多改动了:

```rust
println!("opening file...");
let filename = "hello.txt";
let file = File::create(filename).unwrap();
let writer = Writer::new(&file); // Only this line changed.
```

我们只需调用`Writer::new()`而不是使用`Writer {}`语法来构建.

不过, 这对作用域版本无效:

```rust
let writer = {
    println!("opening file...");
    let filename = "hello.txt";
    Writer::new(&File::create(filename).unwrap()) // Error: Does not live long enough!
};

writer.something(); // Error: File no longer alive here!
```

正如我们之前看到的, 虽然临时生命周期扩展会通过`Writer {}`结构语法传播, 但不会通过`Writer::new()`函数调用语法传播. (例如, 签名可以是`fn new(&File) -> Self<'static>`或`fn new(&File) -> i32`, 这样就不需要扩展临时生命周期了).

遗憾的是, 我们无法明确选择临时生命周期扩展.我们必须在最外层作用域中设置一个`let file`.目前我们能做的最好的办法就是使用延迟初始化:

```rust
let file;
let writer = {
    println!("opening file...");
    let filename = "hello.txt";
    file = File::create(filename).unwrap();
    Writer::new(&file)
};
```

但这会使`file`回到作用域中, 而这正是我们想要避免的.

虽然可以说把`let file`放在作用域外部并不是什么大问题, 但对于大多数`Rust`程序员来说, 这种变通方法并不明显.延迟初始化并不是一个常用的功能, 编译器目前在给出临时生命周期错误时也不会建议采用这种变通方法. 即使编译器可以这样做, 这也不是一个小改动.

如果能以某种方式解决这个问题就好了

### Macros宏

如果有一个函数既能创建文件, 又能返回一个 `Writer` 文件, 可能会很有用.比如

```rust
let writer = Writer::new_file("hello.txt");
```

但是, 由于 `Writer` 只借用`file`, 这就要求 `new_file` 将`File`存储在某个地方.它可以`leak`这个`File`或以某种方式将其存储在`static`中, 但(目前)它没有办法让`file`与返回的 `Writer` 一样长存.

因此, 我们可以使用宏来定义文件和写入器, 无论它在哪里被调用:

```rust
macro_rules! let_writer_to_file {
    ($writer:ident, $filename:expr) => {
        let file = std::fs::File::create($filename).unwrap();
        let $writer = Writer::new(&file);
    };
}
```

使用方法如下:

```rust
let_writer_to_file!(writer, "hello.txt");

writer.something();
```

由于[宏的卫生性](https://veykril.github.io/tlborm/decl-macros/minutiae/hygiene.html), 在此范围内无法访问`file`.

这样做是可行的, 但如果它看起来更像一个普通的函数调用, 不是更好吗？

```rust
et writer = writer_to_file!("hello.txt");

writer.something();
```

正如我们之前所见, 在 `let writer = ...;`语句中创建一个存活时间足够长的临时`File`的方法是使用临时生命周期扩展:

```rust
macro_rules! writer_to_file {
    ($filename:expr) => {
        Writer { file: &File::create($filename).unwrap() }
    };
}

let writer = writer_to_file!("hello.txt");
```

这将扩展成:

```rust
let writer = Writer { file: &File::create("hello.txt").unwrap() };
```

这将在必要时延长临时`File`的生命周期.

但如果`file`不是公开, 我们就不能这样做, 而需要使用 `Writer::new()` 代替.宏需要在调用它的 `let writer = ...;`语句之前插入 `let file`;.这是不可能的.

#### format_args!()

这个问题也是(现在)`format_args!()` 的结果不能存储在 `let` 语句中的原因:

```rust
let f = format_args!("{}", 1); // Error!
something.write_fmt(f);
```

原因是 `format_args!()` 会扩展为类似 `fmt::Arguments::new(&Argument::display(&arg), ...)` 的内容, 其中一些参数是对临时变量的引用.

临时生命周期扩展不适用于函数调用的参数, 因此 `fmt::Arguments` 对象只能在同一语句中使用.

#### pin!()

另一种经常通过宏创建的类型是 `Pin`.粗略地说, 它表示对某个永远不会移动的东西的引用.(具体细节很复杂, 但现在不是很重要).

它是通过一个名为 `Pin::new_unchecked` 的`unsafe`函数创建的, 因为我们需要保证它所引用的值即使在 `Pin` 本身消失后也不会被移动.

使用该函数的最佳方法是使用[`shadowing`](https://doc.rust-lang.org/rust-by-example/variable_bindings/scope.html):

```rust
let mut thing = Thing { … };
let thing = unsafe { Pin::new_unchecked(&mut thing) };
```

因为第二个`thing`会对第一个`thing`产生`shadow`, 所以第一个`thing`(仍然存在)不能再被命名.因为它不能被命名, 所以我们可以确定它不能被移动(即使在放弃第二个`thing`后), 这正是我们在`unsafe`块中所承诺的.

因为这是一种常见的模式, 所以通常用宏来捕获这种模式.

例如, 我们可以定义一个 `let_pin` 宏如下:

```rust
macro_rules! let_pin {
    ($name:ident, $init:expr) => {
        let mut $name = $init;
        let $name = unsafe { Pin::new_unchecked(&mut $name) };
    };
}
```

使用方法与之前的 `let_writer_to_file` 宏类似:

```rust
let_pin!(thing, Thing { … });

thing.something();
```

这样做可以很好地封装和隐藏不安全代码.

但是, 就像我们的 `Writer` 示例一样, 如果它能像下面这样工作, 不是更好吗？

```rust
let thing = pin!(Thing { … });
```

我们都知道, 要做到这一点, 我们必须利用临时生命周期扩展功能, 使`Thing`的生命周期足够长.而要做到这一点, 我们必须使用 `Pin {}` 语法来构造 `Pin:Pin { pinned: &mut Thing { ... }}` 会调用临时生命周期扩展, 但 P`in::new_unchecked(&mut Thing { ... })` 不会.

这就意味着要将 `Pin` 的字段公开, 这就违背了 `Pin` 的初衷.只有在字段是私有的情况下, 它才能提供有意义的保证.

这意味着, 不幸的是, (如今)不可能自己编写这样一个 `pin!()` 宏.

标准库还是这么做了, 犯了一个可怕的罪行:`Pin` 的 "私有 "字段实际上被定义为 `pub`, 但也被标记为 "不稳定", 如果你试图使用它, 编译器就会抱怨.

如果不需要这种黑客手段就好了.

## `super let`

### 用户体验和诊断

### 可能的扩展

## 临时生命周期 2024 RFC

几个月前, 我与*Niko Matsakis*和*Ding Xiang Fei*分享了我的想法--`super let`.他们一直在努力制定`super let`的确切定义和详细规则, 以及下一版`Rust`的临时生命周期的一些新规则.

这项名为 [`“temporary lifetimes 2024” effort`](https://rust-lang.zulipchat.com/#narrow/stream/403629-t-lang.2Ftemporary-lifetimes-2024)的联合工作正在促成一项RFC, 该RFC主要建议尽可能减少临时生命周期, 以防止 `if let` 或匹配中的临时 `MutexGuard` 导致的死锁, 并添加 `super let` 作为选择更长生命周期的一种方式.

## 反馈

你是否有意识地使用过临时延长寿命的方法？或者你被它咬过吗？

你怎么看`super let`？你会使用它吗？或者你有更好的主意？

请在下面的评论或 `GitHub` 上告诉我, 或加入 `Reddit``、Twitter` 或 `Mastodon` 上的讨论.

## 引用

[^1]: https://blog.m-ou.se/super-let
