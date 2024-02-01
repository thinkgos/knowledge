# rust交叉编译

`toolchain`和`target`分别是, `toolchain`是交叉编译所需的“编译工具”, 而`target`则是编译到目标平台所需的"库文件"

## 什么是 `Toolchain`

`toolchain` 指一组`Rust`工具, 包括编译器(`rustc`), 构建工具(`cargo`), 文档生成工具(`rustdoc`)以及其他与 `Rust` 相关的实用程序. `Toolchain`用于管理和构建 Rust 代码, 并且可以包括一个特定版本的 `Rust` 编译器和标准库, 还包含一个默认是编译到本机平台的`target`. 工具链的版本可以是 "stable"(稳定版), "beta"(测试版)或 "nightly"(每日构建版), 每个版本都对应着不同的 `Rust` 编译器和特性. 工具链中的工具命令了, 它们通常存储在`~/.cargo/bin`这个目录下.

## 什么是 `Rustc target`

`Rust` 中的`target`概念主要是为了支持跨平台开发和交叉编译, 以确保 `Rust` 代码可以在不同的操作系统和架构上正确运行. `Rustc target`指的是编译和构建目标平台`Rust`代码时需要的组件. 不要混淆为`Rust`项目编译后产生的`target`文件夹. 它的格式表示为: `<arch>-<vendor>-<os>-<abi>`. 其中: 

- `<arch>` 表示**架构**(例如, x86_64 表示64位的x86架构).
- `<vendor>` 表示**供应商**(一般为空).
- `<os>` 表示**操作系统**(例如, linux, windows, macos 等).
- `<abi>` 表示**二进制接口**(例如, 默认的是 "gnu", 也可以是 "musl", "msvc" 等)

例如:

- `x86_64-unknown-linux-gnu`: 64位 x86 架构, Linux 操作系统, 使用 gnu.
- `x86_64-unknown-linux-musl` 64位 x86 架构, Linux 操作系统, 使用 musl.
- `i686-pc-windows-msvc`: 32位 x86 架构, Windows 操作系统, 使用 MSVC 编译器.

一般来说只需要`rustup target add <target>`命令安装某个目标平台组件即可, 但对于一些特殊平台, 可能需要手动安装相关的交叉编译工具链, 例如*windows msvc*或者*android NDK*.

常用命令:

```shell
# 列出可用的target
rustup target list
# 安装一个新的rustup target add <target>
rustup target add x86_64-unknown-linux-gnu
# 把代码编译到指定平台
cargo build --target x86_64-unknown-linux-gnu
```

## Rust编译流程

```shell
Source code -> MIR -> LLVM IR -> 机器码 -> Target链接 -> 可执行文件或库
```

以`Linux`平台为例, `Rust`编译器就是`rustc`

- 首先会把源码编译为`MIR`
- 然后交给`LLVM`处理, `LLVM`继续把`MIR`先编译成`LLVM IR`.
- 进而编译为目标平台的*机器码*(此时还不是执行文件, 只是一堆机器码)
- 往后就是`target`发挥作用了, `target`调用`msvc`或`gnu`来完成链接步骤, 主要是链接目标平台库文件并生成可执行文件.

这里整个编译过程几乎都是由`rustc`完成的, 因为它包含了`llvm`和调用`target`的代码, 跟目标平台相关的工作则是由`msvc`或`gnu`来完成. `msvc`和`gnu`是`c/c++`的编译工具链, 编译后的最终产物就是可执行文件或库, `rustc`在编译后期用到了它们提供的功能.

## 交叉编译

`Ubuntu`默认的`target`是`gnu`的, 依赖`glibc`, 但是其他`Linux`系统未必是`glibc`是基础库, 但是可以用同一套`toolchain`(编译器之类的), 因此只需要添加`target`即可.

而交叉编译到`Windows`, 则`Linux`的编译器是没有这个能力的, 因此需要添加`Windows`平台的`toolchain`(有部分`toolchain`官方没有实现还得添加第三方的`toolchain`), 然后再添加`target`.
***注意***, 如果`Windows`选择的是`msvc`而非`gnu`, 那么哪怕是最简单的`hello world`也必须要安装`visual studio`(主要是需要它携带的`toolchain`[`linker`等])

## References

- [从Rustup出发看看Rust语言的编译生态](https://mp.weixin.qq.com/s/iXDgb0oph1AaedgV_Aw4Zw)
- [Rust交叉编译最全总结](https://mp.weixin.qq.com/s/mOCpBNa7W-_cCb4Y6-6hgw)