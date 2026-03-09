# c++调试技巧-FailureHandler

c++来说, coredump总是无法避免, 如果服务很吃内存, 那么在写core dump的时候, 会占用很大的内存, 导致服务不可用. 所以可以引入`FailureHandler`机制来快速做一些事件.

`FailureHandler`机制思想比较简单, 其原理还是信号处理, 通过注册信号回调函数来解决上面问题. 在回调函数中, 我们可以

- 快速dump当前堆栈信息
- 主动发送close包给服务发现, 可保证服务稳定性.

## 实现

- [How to automatically generate a stacktrace when my program crashes](https://stackoverflow.com/questions/77005/how-to-automatically-generate-a-stacktrace-when-my-program-crashes)
- `rocksdb`的[InstallStackTraceHandler](https://github.com/facebook/rocksdb/blob/3ad23b2d94a5a674ce138f3e04f77cdb8059618f/port/stack_trace.cc#L401)
