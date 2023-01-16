# 工具

- 代码安全

  - [cargo-tarpaulin](https://crates.io/crates/cargo-tarpaulin) 代码覆盖率

  - [clippy](https://github.com/rust-lang/rust-clippy#clippy) 代码检查

  - [cargo-audit](https://crates.io/crates/cargo-audit) `Cargo.lock`安全审核

  - cargo-flamegraph 在跟踪代码中的性能热点时给了我们巨大的帮助.

  - cargo-geiger 帮助我们快速评估外部依赖，以解决可能的安全性（或正确性）问题.

  - cargo tree（最近集成进了 cargo）显示了一个依赖树，它在许多方面都很有用，但主要用于找出最小化依赖项的途径

  - [cargo-udeps](https://crates.io/crates/cargo-udeps) 可以识别未使用的依赖项，并尽可能减少我们的构建时间

- 即时编译

  - [cargo-watch](https://crates.io/crates/cargo-watch) 即时编译

- 平台编译打包

  - [cross](https://github.com/cross-rs/cross) 零设置的跨平台 交叉编译和交叉测试
  - [cargo-deb](https://crates.io/crates/cargo-deb) 打包成.deb

  - [cargo-generate-rpm](https://github.com/cat-in-136/cargo-generate-rpm) 打包成rpm

  - [cargo-aur](https://crates.io/crates/cargo-aur) 打包成 Arch Linux User Repository
