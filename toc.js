// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item affix "><a href="index.html">Introduction</a></li><li class="chapter-item "><a href="rust/index.html"><strong aria-hidden="true">1.</strong> Rust</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="rust/00-material.html"><strong aria-hidden="true">1.1.</strong> 资料</a></li><li class="chapter-item "><a href="rust/01-memory-model.html"><strong aria-hidden="true">1.2.</strong> 内存模型</a></li><li class="chapter-item "><a href="rust/02-owner-borrow.html"><strong aria-hidden="true">1.3.</strong> 所有权机制-借用规则</a></li><li class="chapter-item "><a href="rust/03-type-system.html"><strong aria-hidden="true">1.4.</strong> 类型系统</a></li><li class="chapter-item "><a href="rust/04-concurrent.html"><strong aria-hidden="true">1.5.</strong> 并发模型</a></li><li class="chapter-item "><a href="rust/05-macro.html"><strong aria-hidden="true">1.6.</strong> 宏</a></li><li class="chapter-item "><a href="rust/06-closure.html"><strong aria-hidden="true">1.7.</strong> 闭包</a></li><li class="chapter-item "><a href="rust/07-error-handling.html"><strong aria-hidden="true">1.8.</strong> 错误处理</a></li><li class="chapter-item "><a href="rust/08-smart-pointer.html"><strong aria-hidden="true">1.9.</strong> 智能指针</a></li><li class="chapter-item "><a href="rust/09-builtin-trait.html"><strong aria-hidden="true">1.10.</strong> 标准trait</a></li><li class="chapter-item "><a href="rust/10-generics.html"><strong aria-hidden="true">1.11.</strong> 类型系统: 泛型</a></li><li class="chapter-item "><a href="rust/11-trait.html"><strong aria-hidden="true">1.12.</strong> 类型系统: trait</a></li><li class="chapter-item "><a href="rust/12-borrow.html"><strong aria-hidden="true">1.13.</strong> 处理借用数据的模块: std::borrow</a></li><li class="chapter-item "><a href="rust/20-how-to-read-code.html"><strong aria-hidden="true">1.14.</strong> 如何阅读源码</a></li></ol></li><li class="chapter-item "><a href="actix-web/index.html"><strong aria-hidden="true">2.</strong> actix-web</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="actix-web/01-handler.html"><strong aria-hidden="true">2.1.</strong> handler原理</a></li></ol></li><li class="chapter-item "><a href="daily-rust/index.html"><strong aria-hidden="true">3.</strong> Rust日记</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="daily-rust/00-crate-you-need-to-know.html"><strong aria-hidden="true">3.1.</strong> 你应知道的crate</a></li><li class="chapter-item "><a href="daily-rust/01-using-immut-vec.html"><strong aria-hidden="true">3.2.</strong> 不可变数据建议Rc&lt;[T]&gt;/Arc&lt;[T]&gt;替代Vec&lt;T&gt;</a></li><li class="chapter-item "><a href="daily-rust/02-rust-temporary-lifetimes-and-super-let.html"><strong aria-hidden="true">3.3.</strong> (译)Rust临时生命周期和&quot;Super Let&quot;</a></li><li class="chapter-item "><a href="daily-rust/03-macro.html"><strong aria-hidden="true">3.4.</strong> 宏系统</a></li><li class="chapter-item "><a href="daily-rust/04-rust-cross-compile.html"><strong aria-hidden="true">3.5.</strong> rust交叉编译</a></li></ol></li><li class="chapter-item "><a href="golang/index.html"><strong aria-hidden="true">4.</strong> Golang</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="golang/ast/index.html"><strong aria-hidden="true">4.1.</strong> Golang AST</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="golang/ast/01-token.html"><strong aria-hidden="true">4.1.1.</strong> token</a></li><li class="chapter-item "><a href="golang/ast/02-基础面值.html"><strong aria-hidden="true">4.1.2.</strong> 基础面值</a></li><li class="chapter-item "><a href="golang/ast/03-基础表达式.html"><strong aria-hidden="true">4.1.3.</strong> 基础表达式</a></li><li class="chapter-item "><a href="golang/ast/04-代码结构.html"><strong aria-hidden="true">4.1.4.</strong> 代码结构</a></li></ol></li><li class="chapter-item "><a href="golang/00-material.html"><strong aria-hidden="true">4.2.</strong> 资料</a></li><li class="chapter-item "><a href="golang/01-quiz.html"><strong aria-hidden="true">4.3.</strong> quiz</a></li><li class="chapter-item "><a href="golang/02-performance-analysis.html"><strong aria-hidden="true">4.4.</strong> golang性能分析pprof</a></li><li class="chapter-item "><a href="golang/03-performance-trace.html"><strong aria-hidden="true">4.5.</strong> golang跟踪剖析trace</a></li></ol></li><li class="chapter-item "><a href="mysql/index.html"><strong aria-hidden="true">5.</strong> mysql</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="mysql/00-基本操作.html"><strong aria-hidden="true">5.1.</strong> 基本操作</a></li><li class="chapter-item "><a href="mysql/01-sql是如何执行的.html"><strong aria-hidden="true">5.2.</strong> sql是如何执行的</a></li><li class="chapter-item "><a href="mysql/02-深入索引全局锁表锁行锁.html"><strong aria-hidden="true">5.3.</strong> 深入索引全局锁表锁行锁</a></li><li class="chapter-item "><a href="mysql/03-数据库的锁.html"><strong aria-hidden="true">5.4.</strong> 数据库的锁</a></li><li class="chapter-item "><a href="mysql/04-事务到底是隔离还是不隔离.html"><strong aria-hidden="true">5.5.</strong> 事务到底是隔离还是不隔离</a></li><li class="chapter-item "><a href="mysql/05-实战-优化.html"><strong aria-hidden="true">5.6.</strong> 实战-优化</a></li><li class="chapter-item "><a href="mysql/06-实战-性能提升.html"><strong aria-hidden="true">5.7.</strong> 实战-性能提升</a></li><li class="chapter-item "><a href="mysql/07-mysql数据储存.html"><strong aria-hidden="true">5.8.</strong> mysql数据储存</a></li><li class="chapter-item "><a href="mysql/08-定位性能瓶颈.html"><strong aria-hidden="true">5.9.</strong> 定位性能瓶颈</a></li></ol></li><li class="chapter-item "><a href="pickup/index.html"><strong aria-hidden="true">6.</strong> Pickup</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="pickup/01-logql.html"><strong aria-hidden="true">6.1.</strong> logql</a></li><li class="chapter-item "><a href="pickup/02-promql.html"><strong aria-hidden="true">6.2.</strong> promql</a></li><li class="chapter-item "><a href="pickup/04-xpath语法.html"><strong aria-hidden="true">6.3.</strong> xpath语法</a></li><li class="chapter-item "><a href="pickup/05-css选择器汇总.html"><strong aria-hidden="true">6.4.</strong> css选择器汇总</a></li><li class="chapter-item "><a href="pickup/06-opentelemetry.html"><strong aria-hidden="true">6.5.</strong> opentelemetry</a></li><li class="chapter-item "><a href="pickup/07-grep-sed-awk.html"><strong aria-hidden="true">6.6.</strong> grep sed awk</a></li><li class="chapter-item "><a href="pickup/20-linux信号.html"><strong aria-hidden="true">6.7.</strong> linux信号</a></li><li class="chapter-item "><a href="pickup/21-linux虚拟化-虚拟网卡技术.html"><strong aria-hidden="true">6.8.</strong> linux虚拟化 虚拟网卡技术</a></li><li class="chapter-item "><a href="pickup/22-iptables.html"><strong aria-hidden="true">6.9.</strong> iptables</a></li><li class="chapter-item "><a href="pickup/23-netcat瑞士军刀.html"><strong aria-hidden="true">6.10.</strong> netcat瑞士军刀</a></li><li class="chapter-item "><a href="pickup/24-netstat详解.html"><strong aria-hidden="true">6.11.</strong> netstat详解</a></li><li class="chapter-item "><a href="pickup/25-tcpdump指南.html"><strong aria-hidden="true">6.12.</strong> tcpdump详解</a></li><li class="chapter-item "><a href="pickup/26-jq详解.html"><strong aria-hidden="true">6.13.</strong> jq详解</a></li><li class="chapter-item "><a href="pickup/80-shell语法.html"><strong aria-hidden="true">6.14.</strong> shell语法</a></li><li class="chapter-item "><a href="pickup/81-cron语法.html"><strong aria-hidden="true">6.15.</strong> cron语法</a></li><li class="chapter-item "><a href="pickup/82-yaml语法.html"><strong aria-hidden="true">6.16.</strong> yaml语法</a></li><li class="chapter-item "><a href="pickup/83-protobuf语法.html"><strong aria-hidden="true">6.17.</strong> protobuf语法</a></li><li class="chapter-item "><a href="pickup/84-ansible.html"><strong aria-hidden="true">6.18.</strong> ansible</a></li><li class="chapter-item "><a href="pickup/85-glob.html"><strong aria-hidden="true">6.19.</strong> glob</a></li><li class="chapter-item "><a href="pickup/86-nats.html"><strong aria-hidden="true">6.20.</strong> nats</a></li><li class="chapter-item "><a href="pickup/100-git.html"><strong aria-hidden="true">6.21.</strong> git</a></li><li class="chapter-item "><a href="pickup/101-rsa.html"><strong aria-hidden="true">6.22.</strong> rsa</a></li><li class="chapter-item "><a href="pickup/998-install-ubuntu.html"><strong aria-hidden="true">6.23.</strong> install ubuntu</a></li><li class="chapter-item "><a href="pickup/999-link.html"><strong aria-hidden="true">6.24.</strong> link</a></li></ol></li><li class="chapter-item "><a href="video/index.html"><strong aria-hidden="true">7.</strong> Video</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="video/01-sdp.html"><strong aria-hidden="true">7.1.</strong> SDP</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
