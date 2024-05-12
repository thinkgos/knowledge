# quiz basic

## 1. `defer` 和 `panic`

**问题: 代码输出什么?**  

```go
package main

import "fmt"

// `defer` 和 `panic`
func main() {
    defer_call()
}

func defer_call() {
    defer func() { fmt.Println("打印前") }()
    defer func() { fmt.Println("打印中") }()
    defer func() { fmt.Println("打印后") }()

    panic("触发异常")
}
```

**解答**:

```text
打印后
打印中
打印前
panic: 触发异常
```

**解析**:
> `defer` 的执行顺序是**先进后出,后进先出**的顺序执行.
> 出现panic语句的时候,会先按照`defer` 的后进先出顺序执行,最后才会执行`panic`.

## 2. `array`和`slice`

**问题: 以下代码只注释掉 ② 输出什么？如果只注释 ① 又输出什么?**

```go
package main

import "fmt"

func main() {
    a := [2]int{5, 6}
    b := [2]int{5, 6}

    // ①
    if a == b {
        fmt.Println("equal")
    } else {
        fmt.Println("not equal")
    }

    // ②
    // if a[:] == b[:] {
    //     fmt.Println("equal")
    // } else {
    //     fmt.Println("not equal")
    // }
}
```

**解答**:

```text
  array是可以比较的,slice是不可以比较的.
  所以:
    ①为equal
    ②为编译不通过
```

**解析**:
> `array`是可以比较的,必须要求一样数组大小才可以比较,且len和cap是一样的.
> `slice`不可直接比较,只可以与nil比较.

## 3. `nil`的`chan`

**问题: 代码输出什么?**

```go
package main

func main() {
    var ch chan int
    select {
    case v, ok := <-ch:
        println(v, ok)
    default:
        println("default")
    }
}
```

**解答**:

```text
输出: 
    default
```

**解析**:
> 一个nil的chan是永远不会被select到,  
> 一个nil的chan发送和接收会永远的阻塞  
> 关闭的chan永远能select到

## 4. 传值共享slice

**问题: 代码输出什么?**

```go
package main

import "fmt"

type T struct {
    ls []int
}

func foo(t T) {
    t.ls[0] = 100
}

func main() {
    var t = T{
        ls: []int{1, 2, 3},
    }

    foo(t)
    fmt.Println(t.ls[0])
}

```

- A. 1
- B. 100
- C. compilation error

**解答**: 输出B

**解析**:
> 调用`foo()`函数时虽然是传值，但`foo()`函数中，字段`ls`依旧可以看成是指向底层数组的指针。

## 5. 不可寻址的临时变量

**问题: 代码输出什么?**

```go
package main

type X struct{}

func (x *X) test() {
    println(x)
}

func main() {
    var a *X
    a.test()

    // X{}.test()
}
```

**解答**:

```text
    但是nil是可以调用方法的
    X{} 是不可寻址的，不能直接调用方法
```

**解析**:
> 在方法中，指针类型的接收者必须是合法指针（包括 nil）,或能获取实例地址。

## 6. 切片截取问题

**问题: 代码输出什么?**

```go
package main

import "fmt"

func main() {
    s := make([]int, 3, 9)
    fmt.Println(len(s))
    s2 := s[4:8]
    fmt.Println(len(s2))
}
```

**解答**:

```text
    3
    4
```

**解析**:
> 从一个基础切片派生出的子切片的长度可能大于基础切片的长度。  
> 假设基础切片是 baseSlice，使用操作符 [low,high]，有如下规则：0 <= low <= high <= cap(baseSlice)，  
> 只要上述满足这个关系，下标 low 和 high 都可以大于 len(baseSlice)。

## 7. 方法值传递

**问题: 代码输出什么?**

```go
package main

import "fmt"

type N int

func (n N) test() {
    fmt.Println(n)
}

func main() {
    var n N = 10
    p := &n

    n++
    f1 := n.test

    n++
    f2 := p.test

    n++
    fmt.Println(n)

    f1()
    f2()
}
```

**解答**:

```text
13
11
12
```

**解析**:
> 知识点：方法值。  
> 当指针值赋值给变量或者作为函数参数传递时，会立即计算并复制该方法执行所需的接收者对象，与其绑定，以便在稍后执行时，能隐式第传入接收者参数。

## 8. 方法指针传递

**问题: 代码输出什么?**

```go
package main

import "fmt"

type N int

func (n *N) test() {
    fmt.Println(*n)
}

func main() {
    var n N = 10

    n++
    f1 := n.test

    n++
    f2 := n.test

    n++
    fmt.Println(n)

    f1()
    f2()
}
```

**解答**:

```text
13
13
13
```

**解析**:
> 传入的为指针,所以值为最后的结果值

## 9. 切片截取问题

**问题: 代码输出什么?**

```go
package main

func main() {
    x := make([]int, 2, 10)
    _ = x[6:10]
    _ = x[2:]
    _ = x[6:]
}
```

**解答**:

```text
    _ = x[6:] 将panic
```

**解析**:

> _ = x[6:] 在截取符号 [i:j]，如果 j 省略，默认是原切片或者数组的长度,即len(x)，x 的长度是 2，小于起始下标 6 ，所以 panic。

## 10. 空struct内存对齐

**问题: 代码输出什么?**

```go
package main

import (
    "fmt"
    "unsafe"
)

type demo0 struct {
    b int32
    c int32
    a struct{}
}

type demo1 struct {
    a struct{}
    b int32
    c int32
}

type demo2 struct {
    b int32
    a struct{}
    c int32
}

func main() {
    fmt.Println(unsafe.Sizeof(demo0{}), unsafe.Sizeof(demo1{}), unsafe.Sizeof(demo2{}))
}
```

**解答**:

```text
 12 8 8 
```

**解析**:

> 空 `struct{}` 大小为 0，作为其他 struct 的字段时，一般不需要内存对齐。  
> 但是有一种情况除外：即当 `struct{}` 作为结构体最后一个字段时，需要内存对齐。
> 因为如果有指针指向该字段, 返回的地址将在结构体之外，如果此指针一直存活不释放对应的内存，就会有内存泄露的问题（该内存不因结构体释放而释放）。

## 11. len内置函数

**问题: 代码输出什么?**

[原文](https://mp.weixin.qq.com/s?__biz=MzAxMTA4Njc0OQ==&mid=2651442060&idx=2&sn=29a3f39ec2d95d6b5177e53277c5f94c&chksm=80bb157eb7cc9c68f9b2574cb259678580b194cf20d83d84840818bae9712fe3e0246e249a97&mpshare=1&scene=24&srcid=1130fgz3Kg9VvJpRLR3OLUVS&sharer_sharetime=1606715319571&sharer_shareid=fbafc624aa53cd09857fb0861ac2a16d&exportkey=AZIxDLHvvkwjXPkmuEeWCtI%3D&pass_ticket=xSGb7TkoIuLZz7AFBdlYeR4qEQC4h9uTHgeYZjnzNlVCg1RDSSP3MJjeOxdI2wvs&wx_header=0#rd)

```go
package main

const s = "Go101.org"

// len(s) == 9
// 1 << 9 == 512
// 512 / 128 == 4

var a byte = 1 << len(s) / 128
var b byte = 1 << len(s[:]) / 128

func main() {
    println(a, b)
}
```

**解答**:

```text
4 0
```

**解析**:
> **a. 常量与求值**  
> 当参数是字符串字面量和简单 array 表达式，len 函数返回值是常量.  
> > 内置函数 len 和 cap 获取各种类型的实参并返回一个 int 类型结果。实现会保证结果总是一个 int 值。
> >
> > - 如果 s 是一个字符串常量，那么 len(s) 是一个常量 。
> > - 如果 s 类型是一个数组或到数组的指针且表达式 s 不包含 信道接收 或（非常量的） 函数调用的话， 那么表达式 len(s) 和 cap(s) 是常量；这种情况下， s 是不求值的。
> > - 否则的话， len 和 cap 的调用结果不是常量且 s 会被求值
> >   所以`len(s)`与`len(s[:])`前者返回是常量,后者是求值的值
>
> **b. 位移**
>
> > 在位移表达式的右侧的操作数必须为整数类型，或者可以被 uint 类型的值所表示的无类型的常量。
> >
> > - 如果**一个`非常量位移表达式的左侧`的操作数是一个无类型常量**，那么它会先被隐式地转换为假如位移表达式被其左侧操作数单独替换后的类型。
> >
> > - 如果**`常量位移表达式 的左侧`的操作数是一个无类型常量**，那么其结果是一个整数常量；否则就是和左侧操作数同一类型的常量
>
> 因此对于 `var a byte = 1 << len(s) / 128`，因为 `1 << len(s)`是***一个常量位移表达式***，因此它的结果也是一个整数常量，所以是 512，最后除以 128，最终结果就是 4。
>
> 而对于 `var b byte = 1 << len(s[:]) / 1281`，因为 `1 << len(s[:])`是一个***非常量位移表达式***，而做操作数是 1，一个无类型常量，根据规范定义它是 byte 类型（根据：如果一个非常量位移表达式的左侧的操作数是一个无类号常量，那么它会先被隐式地转换为假如位移表达式被其左侧操作数单独替换后的类型.
> 即1为byte型,右移溢出,所以为0

## 12. 补码

**问题: 代码输出什么?**  
[原文](https://mp.weixin.qq.com/s?__biz=MzAxMTA4Njc0OQ==&mid=2651442141&idx=2&sn=1e565dd411fb82584a7093f40a750be2&chksm=80bb152fb7cc9c390add4b13d217984bd3334ea9bbb1b45357c6d979b9d37499fb8cf9e26004&mpshare=1&scene=24&srcid=1130xlWjBiMct2BMLtmpjm5S&sharer_sharetime=1606715340255&sharer_shareid=fbafc624aa53cd09857fb0861ac2a16d&exportkey=Aa%2Fz3pSgi%2B5meJijFHg1ppE%3D&pass_ticket=xSGb7TkoIuLZz7AFBdlYeR4qEQC4h9uTHgeYZjnzNlVCg1RDSSP3MJjeOxdI2wvs&wx_header=0#rd)

```go
package main

func main() {
    // // 题1
    var a int8 = -1
    var b int8 = -128 / a
    println(b)

    // 题2
    // const c int8 = -1
    // var d int8 = -128 / c
    // println(d)
}
```

**解答**:

```text
    题1: -128
    题2: 编译错误
```

**解析**:
> const隐式转换不允许溢出,所以编译错误
