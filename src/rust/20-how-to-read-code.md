# 如何阅读源码

> 以下是 Rust 文档为例

读`Rust`代码的基本顺序: 

- 从 `crate` 的大纲开始, 先了解目标代码能干什么,怎么用.
- 学习核心 `trait`, 看看它支持哪些功能.
- 掌握主要的数据结构, 开始写一些示例代码
- 围绕自己感兴趣的情景深入阅读.

## 1. 从大纲开始

`Rust` 几乎所有库的文档都在 [`docs.rs`](https://docs.rs/) 下, 比如 `Bytes` 的文档可以通过 [docs.rs/bytes](https://docs.rs/bytes/latest/bytes/) 访问

- trait
- struct
- 函数/方法

和写代码的思考方式非常类似:

- 先从需求的流程中敲定系统的行为, 需要定义什么接口 trait；
- 再考虑系统有什么状态, 定义了哪些数据结构 struct；
- 最后到实现细节, 包括如何为数据结构实现 trait、数据结构自身有什么算法、如何把整个流程串起来等等. 

## 2. 熟悉核心 trait 的行为

所以先看 `trait`, 我们以 `Buf trait` 为例. 点进去看文档, 主页面给了这个 `trait` 的定义和一个使用示例. 

左侧导航栏的 **“required Methods”** 和 **“Provided Methods”**, 前者是实现这个 `trait` 需要实现的方法, 后者是缺省方法.

导航栏继续往下拉, 可以看到 `bytes` 为哪些 **“foreign types”** 实现了 `Buf trait`, 以及当前模块有哪些 `implementors`. 

可以学习到高手定义 trait 的一些思路：

- 定义好 `trait` 后, 可以考虑一下标准库的数据结构, 哪些可以实现这个 trait. 
- 如果未来别人的某个类型 `T` , 实现了你的 `trait`, 那他的 `&T`、`&mut T`、`Box` 等衍生类型, 是否能够自动实现这个 trait. 

## 3. 掌握主要的 struct

和 `trait` 类似的, 在左侧的导航栏, 有一些值得关注的信息：这个数据结构有哪些方法 (**Methods**) 、实现了哪些 **trait** (Trait implementations) , 以及 **Auto trait** / **Blanket trait** 的实现. 可以看到, `Bytes` 除了实现了刚才讲过的 `Buf trait` 外, 还实现了很多标准 `trait`. 

所以: **我们自己的数据结构, 也应该尽可能实现需要的标准 trait**, 包括但不限于：`AsRef`、`Borrow`、`Clone`、`Debug`、`Default`、`Deref`、`Drop`、`PartialEq`/`Eq`、`From`、`Hash`、`IntoIterator` (如果是个集合类型) 、`PartialOrd`/`Ord` 等

## 4. 深入研究实现逻辑
