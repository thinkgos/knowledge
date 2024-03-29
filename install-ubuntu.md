# install ubuntu

## 修改软件源

### 图形修改

系统设置 -> 软件和更新 选择下载服务器 -> "mirrors.aliyun.com"

### 手动修改

`/etc/apt/sources.list`

替换默认的`http://archive.ubuntu.com/`为`http://mirrors.aliyun.com/`

ubuntu22.04为以下配置

```shell
deb https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse

# deb https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
```

## 安装基础软件

```shell
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install vim zsh git curl jq gcc make cmake tmux
```

### 配置git

```shell
git config --global user.name ""
git config --global user.email ""
```

```shell
[user]
    name = example 
    email = example@example.com
[core]
    # autocrlf
    # windows 和linux 换行符差异,需要配置换行符
    # windows 是CRLF
    # linux/mac是LF
    # 保存仓库永远为LF,在Windows工作空间都是CRLF, 在Mac/Linux工作空间都是LF.
    # windows配置`autocrlf = true`, 提交时自动CRLF转LF, 检出时自动将LF转CRLF
    # linux/mac配置`autocrlf = input`,提交时自动CRLF转LF, 检出时自动将保持LF.

    # safecrlf
    #拒绝提交包含混合换行符的文件
    safecrlf=true   
    #允许提交包含混合换行符的文件
    safecrlf=false
    #提交包含混合换行符的文件时给出警告
    safecrlf= warn
    autocrlf = input
    pager = delta
    editor = vim
[interactive]
    diffFilter = delta --color-only
[add.interactive]
    useBuiltin = false # required for git 2.37.0

[delta]
    navigate = true    # use n and N to move between diff sections
    light = false      # set to true if you're in a terminal w/ a light background color (e.g. the default macOS terminal)
    side-by-side = true
[merge]
    conflictstyle = diff3

[diff]
    colorMoved = default
```

### 安装输入法

```shell
sudo apt update
sudo apt install fcitx5 fcitx5-chinese-addons fcitx-config-gtk 
```

配置 **语言支持** 为 `fcitx5`

### 安装`gnome-tweaks`

```shell
sudo apt install gnome-tweaks
```

### zsh配置

#### 设置zsh为默认

```shell
# 设置默认shell, 需要重启
chsh -s $(which zsh)
```

#### 安装[ohmyzsh](https://github.com/ohmyzsh/ohmyzsh)

`sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`

#### 配置zsh

```shell
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 
git clone https://github.com/thinkgos/minority.git  .minority
# 软链接
ln -s ~/.minority/zshrc/.zshrc ~/.zshrc
ln -s ~/.minority/vim/.vimrc ~/.vimrc 
ln -s ~/.minority/zshrc/starship.toml ~/.config/startship.toml 
ln -s ~/.minority/minority/zellij ~/.config/zellij
```

### 安装rust

[Install Rust](https://www.rust-lang.org/tools/install)

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

```conf
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
replace-with = "ustc"

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
[registries.ustc]
index = "https://mirrors.ustc.edu.cn/crates.io-index"

[build]
rustc-wrapper = ".cargo/bin/sccache"
[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=/usr/local/bin/mold"]
```

### 安装go

#### 使用goup安装

#### 配置 `.zshenv`

```shell
# goup
. "$HOME/.goup/env"
# go
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

#### 配置代理

```shell
go env -w GOPROXY=https://goproxy.cn,direct
```
