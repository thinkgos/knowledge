# c++调试技巧-Sanitizers

- [Sanitizers](https://github.com/google/sanitizers) 目前该功能已合并入LLVM项目.
- [LLVM compiler-rt](https://compiler-rt.llvm.org/)
  - [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html) 用于检测内存使用错误
  - [ThreadSanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html) 用于检测多线程间的数据竞争和死锁
  - [MemorySanitizer](https://clang.llvm.org/docs/MemorySanitizer.html) 用于检测使用未初始化内存的行为
  - [LeakSanitizer](https://clang.llvm.org/docs/LeakSanitizer.html) 用于检测内存泄露
