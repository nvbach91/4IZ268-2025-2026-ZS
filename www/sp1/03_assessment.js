const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { JSDOM } = require("jsdom");
const sizeOf = require("image-size");
const css = require("css");


const loadSite = (rootDir) => {
    const htmlFiles = glob.sync("**/*.html", { cwd: rootDir });
    const pages = htmlFiles.map((file) => {
        const fullPath = path.join(rootDir, file);
        const html = fs.readFileSync(fullPath, "utf8");
        const dom = new JSDOM(html);
        return { file, html, dom, document: dom.window.document };
    });

    return { pages, rootDir };
};

const checkOptimizedImages = (site) => {
    const feedback = [];
    let score = 10;

    site.pages.forEach(({ document, file }) => {
        document.querySelectorAll("img").forEach(img => {
            const src = img.getAttribute("src");
            if (!src || src.startsWith("http")) return;

            try {
                const imgPath = path.join(site.rootDir, src);
                const dimensions = sizeOf(imgPath);

                if (dimensions.width > 2000) {
                    feedback.push(`${file}: Image ${src} is very wide — consider resizing.`);
                    score -= 2;
                }

                if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
                    feedback.push(`${file}: Image ${src} should define width and height.`);
                    score -= 1;
                }
            } catch { }
        });
    });

    return { name: "Performance: Images", score: Math.max(score, 0), maxScore: 10, feedback };
};

const checkNoDataURLs = (site) => {
    const feedback = [];
    let score = 10;

    site.pages.forEach(({ document, file }) => {
        document.querySelectorAll("img").forEach(img => {
            const src = img.getAttribute("src");
            if (src && src.startsWith("data:")) {
                feedback.push(`${file}: Avoid base64 images — use image files instead.`);
                score -= 5;
            }
        });
    });

    return { name: "Performance: Data URLs", score: Math.max(score, 0), maxScore: 10, feedback };
};

const checkDuplicateCSS = (site) => {
    const feedback = [];
    let score = 15;
    const selectors = new Set();

    const cssFiles = glob.sync("**/*.css", { cwd: site.rootDir });

    cssFiles.forEach(file => {
        const content = fs.readFileSync(path.join(site.rootDir, file), "utf8");
        const ast = css.parse(content);

        ast.stylesheet.rules.forEach(rule => {
            if (rule.selectors) {
                rule.selectors.forEach(sel => {
                    if (selectors.has(sel)) {
                        feedback.push(`Duplicate CSS selector "${sel}" found in ${file}.`);
                        score -= 2;
                    } else {
                        selectors.add(sel);
                    }
                });
            }
        });
    });

    return { name: "Maintainability: CSS Duplication", score: Math.max(score, 0), maxScore: 15, feedback };
};

const checkAssetStructure = (site) => {
    const feedback = [];
    let score = 10;

    const badAssets = glob.sync("*.{css,js,png,jpg,jpeg,svg}", {
        cwd: site.rootDir
    });

    if (badAssets.length > 0) {
        feedback.push("Assets should be organized into folders (css/, images/, js/).");
        score -= 5;
    }

    return { name: "Maintainability: Structure", score, maxScore: 10, feedback };
};

const checkFriendlyURLs = (site) => {
    const feedback = [];
    let score = 10;

    site.pages.forEach(({ document, file }) => {
        document.querySelectorAll("a[href]").forEach(a => {
            const href = a.getAttribute("href");
            if (href && href.endsWith("index.html")) {
                feedback.push(`${file}: Avoid including index.html in URLs (${href}).`);
                score -= 1;
            }
        });
    });

    return { name: "Accessibility: URLs", score: Math.max(score, 0), maxScore: 10, feedback };
};

const checkFavicon = (site) => {
    const feedback = [];
    let score = 10;

    site.pages.forEach(({ document, file }) => {
        const icon = document.querySelector('link[rel~="icon"]');
        if (!icon) {
            feedback.push(`${file}: Missing favicon.`);
            score -= 2;
        }
    });

    return { name: "Accessibility: Favicon", score: Math.max(score, 0), maxScore: 10, feedback };
};

const checkContactLinks = (site) => {
    const feedback = [];
    let score = 10;

    const html = site.pages.map(p => p.html).join("");

    if (!html.includes("mailto:")) {
        feedback.push("Include at least one email link using mailto:.");
        score -= 5;
    }

    if (!html.includes("tel:")) {
        feedback.push("Include at least one phone link using tel:.");
        score -= 5;
    }

    return { name: "Accessibility: Contact Links", score, maxScore: 10, feedback };
};

const checkLinkTargets = (site) => {
    const feedback = [];
    let score = 10;

    site.pages.forEach(({ document, file }) => {
        document.querySelectorAll("a[href]").forEach(a => {
            const href = a.getAttribute("href");
            const target = a.getAttribute("target");

            if (href.startsWith("http") && target !== "_blank") {
                feedback.push(`${file}: External link should open in new tab.`);
                score -= 1;
            }

            if (!href.startsWith("http") && target === "_blank") {
                feedback.push(`${file}: Internal links should open in same tab.`);
                score -= 1;
            }
        });
    });

    return { name: "Accessibility: Link Behavior", score: Math.max(score, 0), maxScore: 10, feedback };
};

const checkSEOTags = (site) => {
    const feedback = [];
    let score = 15;

    site.pages.forEach(({ document, file }) => {
        if (!document.querySelector("meta[name='description']")) {
            feedback.push(`${file}: Missing meta description.`);
            score -= 2;
        }
        if (!document.querySelector("meta[name='author']")) {
            feedback.push(`${file}: Missing meta author.`);
            score -= 2;
        }
        if (!document.querySelector("meta[name='keywords']")) {
            feedback.push(`${file}: Missing meta keywords.`);
            score -= 2;
        }
        const titleElement = document.querySelector("title");
        if (!titleElement) {
            feedback.push(`${file}: Missing <title>.`);
            score -= 2;
        } else {
            if (titleElement.textContent.split(/[|-–]/).length < 2) {
                feedback.push(`${file}: <title> must include website name and the current page name separated by a pipeline or dash`);
            }
        }
    });

    return { name: "SEO", score: Math.max(score, 0), maxScore: 15, feedback };
};

const checkRequiredSemantics = (site) => {
    const feedback = [];
    const maxScore = 20;
    let score = maxScore;

    const requiredTags = [
        "header",
        "main",
        "section",
        "article",
        // "footer",
        "nav",
        "aside"
    ];

    site.pages.forEach(({ document, file }) => {
        const found = requiredTags.some(tag =>
            document.querySelector(tag)
        );

        if (!found) {
            feedback.push(
                `${file}: No semantic layout elements found. Use tags like ${requiredTags.map((t) => `<${t}>`).join(', ')} instead of only <div>.`
            );
            score -= 4; // per-page penalty
        }
    });

    return {
        name: "Semantics (Required)",
        score: Math.max(score, 0),
        maxScore,
        feedback
    };
};

const extractSnippet = (text, index, radius = 20) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + radius);
    return text.slice(start, end).replace(/\s+/g, " ").trim();
};

const checkEscaping = (site) => {
    const feedback = [];
    let score = 10;
    const maxScore = 10;

    const entityRegex = /&(?!amp;|lt;|gt;|quot;|apos;|copy;)/g;
    const angleRegex = /[<>]/g;

    site.pages.forEach(({ document, dom, file }) => {
        const NodeFilter = dom.window.NodeFilter;
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while ((node = walker.nextNode())) {
            const text = node.nodeValue;

            // Skip whitespace-only nodes
            if (!text || !text.trim()) continue;

            // Detect raw &
            const ampMatches = [...text.matchAll(entityRegex)];
            ampMatches.forEach(match => {
                feedback.push(
                    `${file}: Unescaped "&" detected in text: "${extractSnippet(text, match.index)}"`
                );
                score -= 1;
            });

            // Detect raw < >
            const angleMatches = [...text.matchAll(angleRegex)];
            angleMatches.forEach(match => {
                feedback.push(
                    `${file}: Unescaped "${match[0]}" detected in text: "${extractSnippet(text, match.index)}"`
                );
                score -= 1;
            });
        }
    });

    return {
        name: "Escaping",
        score: Math.max(score, 0),
        maxScore,
        feedback
    };
};

const loadSubmissions = (rootDir) => {
    return fs.readdirSync(rootDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => ({
            studentId: d.name,
            path: path.join(rootDir, d.name)
        }));
};

const checkMinPages = (site) => {
    const feedback = [];
    const htmlFiles = glob.sync("**/*.html", { cwd: site.rootDir });

    let score = 10;
    if (htmlFiles.length < 5) {
        feedback.push(
            `Website contains ${htmlFiles.length} HTML pages. Minimum required is 5.`
        );
        score = 0;
    }

    return {
        name: "Site Size",
        score,
        maxScore: 10,
        feedback
    };
};

const gradeStudent = async (studentDir) => {
    const site = loadSite(studentDir);

    const results = {
        score: 0,
        maxScore: 0,
        feedback: [],
        breakdown: {}
    };

    const checks = [
        checkMinPages,
        checkOptimizedImages,
        checkNoDataURLs,
        checkDuplicateCSS,
        checkAssetStructure,
        checkFriendlyURLs,
        checkFavicon,
        checkContactLinks,
        checkLinkTargets,
        checkSEOTags,
        checkEscaping,
        checkRequiredSemantics,
    ];

    for (const check of checks) {
        const result = await check(site);
        results.score += result.score;
        results.maxScore += result.maxScore;
        results.feedback.push(...result.feedback);
        results.breakdown[result.name] = result;
    }

    return results;
};

const gradeAllStudents = async (submissionsDir) => {
    const students = loadSubmissions(submissionsDir);
    const reports = [];

    for (const student of students) {
        console.log(`Grading ${student.studentId}...`);
        const report = await gradeStudent(student.path);

        reports.push({
            studentId: student.studentId,
            ...report
        });
    }

    return reports;
};

const saveReports = (reports, outputDir) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    reports.forEach(r => {
        fs.writeFileSync(
            path.join(outputDir, `${r.studentId}.json`),
            JSON.stringify(r, null, 2)
        );
    });
};

(async () => {
    const submissionsDir = "./submissions";
    const outputDir = "./reports";

    const reports = await gradeAllStudents(submissionsDir);
    saveReports(reports, outputDir);

    console.log("Grading complete.");
})();
