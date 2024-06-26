# 二. mysql是如何执行的

## 1. MySQL 的逻辑架构图

![img](http://imgur.thinkgos.cn/imgur/202110281013644.png)

- Server层: 包括**连接器**、**查询缓存**、**分析器**、**优化器**、**执行器**等, 涵盖 MySQL 的大多数核心服务功能, 以及所有的内置函数(如日期、时间、数学和加密函数等), 所有跨存储引擎的功能都在这一层实现, 比如存储过程、触发器、视图等
- 存储引擎层: **负责数据的存储和提取**。其架构模式是插件式的, 支持 InnoDB、MyISAM、Memory 等多个存储引擎。现在最常用的存储引擎是 *InnoDB*, 它从 MySQL 5.5.5 版本开始成为了默认存储引擎.

**大多数情况下我会建议你不要使用查询缓存, 因为查询缓存往往弊大于利** (注意: *mysql8.0*版本已没有查询缓存功能.)

## 2. 日志模块

- **InnoDB引擎**的`redo log`: 物理日志,固定大小文件(一组`4`个文件,每个文件的大小是`1GB`),循环写的,可配置,当发生日志满时,将发生写盘事件. 保证服务器发生异常重启,还能保证记录不丢失,**crash-safe**能力
- **Server层**日志`binlog`(归档日志): 逻辑日记,追加写入的.

> - `redo log`是 InnoDB 引擎特有的；`binlog` 是 MySQL 的 Server 层实现的, 所有引擎都可以使用。
> - `redo log` 是物理日志, 记录的是“在某个数据页上做了什么修改”；`binlog` 是逻辑日志, 记录的是这个语句的原始逻辑, 比如“给 ID=2 这一行的 c 字段加 1 ”。
> - `redo log` 是循环写的, 空间固定会用完；`binlog`是可以追加写入的。“追加写”是指 binlog 文件写到一定大小后会切换到下一个, 并不会覆盖以前的日志。
>

日志的配置:

- `innodb_flush_log_at_trx_commit` 这个参数设置成 1 的时候, 表示每次事务的 redo log 都直接持久化到磁盘

- `sync_binlog` 这个参数设置成 1 的时候, 表示每次事务的 binlog 都持久化到磁盘
