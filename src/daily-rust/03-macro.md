# 宏系统

## 声明宏

## 过程宏

| 类别 | 形式 | 函数名称 | 函数签名 |
| --- | --- | --- | --- |
|函数式| `#[paoc_macro]` | 函数名即宏名 | `(TokenStream) -> TokenStream` |
|属性式| `#[proc_macro_attribute]` | 函数名即宏名 | `(TokenStream, TokenStream) -> TokenStream` |
|`derive`式 |`#[proc_macro_derive(Name)]`或者`#[proc_macro_derive(Name, attributes(attr))]` | 任意,因为宏名是`Name` | `(TokenStream) -> TokenStream` |

### proc-macro crate

定义一个过程宏`crate`的方式是将在[`crate type`](https://doc.rust-lang.org/nightly/reference/linkage.html)设为`proc-macro`.

当使用`Cargo`时, 过程宏`crate`是将`Cargo.toml`中的`lib.proc-macro`设为`true`值.

```toml
[lib]
proc-macro = true
```

它只能导出过程宏, 正常的函数、类型、模块、`macro_rules!` 等内容都不能导出, 但可以仅在其内部定义和使用.

### 函数式过程宏

类型函数的过程宏, 像声明宏那样被调用, 即`makro!(...)`. 它是唯一一个在单独看调用形式时, 无法与声明宏区分开的宏.

函数式过程宏的简单编写框架如下所示:

```rust
use proc_macro::TokenStream;

#[proc_macro]
pub fn fn_name_macro(input: TokenStream) -> TokenStream {
    input
}

```

可以看到, 这实际上只是从一个`TokenStream`到另一个`TokenStream`的映射, 其中 input 是调用分隔符内的标记.

### 属性式过程宏

属性式过程宏定义了可添加到条目的的新外部属性.这种宏通过 `#[attr]` 或 `#[attr(…)]` 方式调用, 其中 `…` 是任意标记树.

属性式过程宏的简单框架如下所示：

```rust
use proc_macro::TokenStream;

#[proc_macro_attribute]
pub fn attribute_name_macro(input: TokenStream, annotated_item: TokenStream) -> TokenStream {
    annotated_item
}
```

需要注意的是, 与其它两个过程宏不同, 这种宏有两个输入参数.

- 第一个参数是属性名称后面的带分隔符的标记树, 不包括它周围的分隔符.如果只有属性名称(其后不带标记树, 比如 `#[attr]`), 则这个参数的值为空.
- 第二个参数是添加了该过程宏属性的条目, 但不包括该过程宏所定义的属性.因为这是一个[`active`](https://doc.rust-lang.org/reference/attributes.html#active-and-inert-attributes)属性, 在传递给过程宏之前, 该属性将从条目中剥离出来.

### `derive`式过程宏

`derive`式过程宏为`derive`属性定义了新的输入.这种宏通过将其**名称**提供给`derive`属性的输入来调用, 例如 `#[derive(derive_name)]`.

`derive`式过程宏的简单框架如下所示：

```rust
use proc_macro::TokenStream;

#[proc_macro_derive(derive_name)]
pub fn derive_name_macro(input: TokenStream) -> TokenStream {
    TokenStream::new()
}
```

`proc_macro_derive`稍微特殊一些, 因为它需要一个额外的标识符, 此标识符将成为 `derive` 宏的实际名称.
输入标记流是添加了 `derive` 属性的条目, 也就是说, 它将始终是 `enum`、`struct` 或者 `union` 类型, 因为这些是 `derive` 属性仅可以添加上去的条目.

输出的标记流将被**追加**到带注释的条目所处的块或模块, 所以要求标记流由一组有效条目组成.

> 属性宏与 `derive` 宏的显著区别在于, 属性宏生成的标记是**完全替换**性质, 而 `derive` 宏生成的标记是**追加**性质.

#### `derive`式过程宏的辅助属性

`derive` 宏又有一点特殊, 因为它可以添加仅在条目定义范围内可见的附加属性.
这些属性被称为派生宏辅助属性(derive macro helper attributes), 并且是惰性的([`inert`](https://doc.rust-lang.org/reference/attributes.html#active-and-inert-attributes)).
辅助属性的目的是在每个结构体字段或枚举体成员的基础上为 `derive` 宏提供额外的可定制性.

辅助属性的定义方式是向 `proc_macro_derive` 属性增加 `attributes(helper0, helper1, ..)` 参数, 该参数可包含用逗号分隔的标识符列表(即辅助属性的名称).

编写带辅助属性的`derive``宏的简单框架如下所示：

```rust
use proc_macro::TokenStream;

#[proc_macro_derive(derive_name, attributes(helper0, helper1, ...))]
pub fn derive_name_macro(input: TokenStream) -> TokenStream {
    TokenStream::new()
}
```

这就是辅助属性的全部内容.在过程宏中使用(或者说消耗)辅助属性, 得检查字段和成员的属性, 来判断它们是否具有相应的辅助属性
如果条目使用了所有 derive 宏都未定义的辅助属性, 那么会出现错误, 因为编译器会尝试将这个辅助属性解析为普通属性(而且这个属性并不存在).

## Reference

- [宏小册](https://zjp-cn.github.io/tlborm/introduction.html)
- [The Little Book of Rust Macros](https://veykril.github.io/tlborm/)
- [The Rust Reference - Macros](https://doc.rust-lang.org/nightly/reference/macros.html)
- [Proc-Macro-Workshop](https://github.com/dtolnay/proc-macro-workshop)
