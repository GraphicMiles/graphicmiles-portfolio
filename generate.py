#!/usr/bin/env python3
import json, re, html as H

ROOT_HEAD = """<!DOCTYPE html>
<html lang="en" data-root="{root}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <link rel="icon" href="{root}favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&display=swap">
    <link rel="stylesheet" href="{root}css/styles.css">
</head>
<body data-page="{page}">
<div class="wrap">
"""

FOOT = """
</div>
<div id="toast"></div>
<script src="{root}js/main.js"></script>
</body>
</html>
"""

ARROW_NE = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>"""
ARROW_DOWN = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></svg>"""
ARROW_RIGHT = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>"""
COPY_ICON = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>"""
BACK_ICON = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5303 5.46967C10.8232 5.76256 10.8232 6.23744 10.5303 6.53033L5.81066 11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H5.81066L10.5303 17.4697C10.8232 17.7626 10.8232 18.2374 10.5303 18.5303C10.2374 18.8232 9.76256 18.8232 9.46967 18.5303L3.46967 12.5303C3.17678 12.2374 3.17678 11.7626 3.46967 11.4697L9.46967 5.46967C9.76256 5.17678 10.2374 5.17678 10.5303 5.46967Z" fill="currentColor"></path></svg>"""
SEARCH_ICON = """<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>"""
EXT_ICON = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z" fill="currentColor"></path></svg>"""

SOCIALS = """
<div class="socials">
    <a target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" href="https://ng.linkedin.com/in/munachi-onyebuchi-90b6a12a8"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5M8 19H5V8h3zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764M20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476z"></path></svg></a>
    <a target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" href="https://x.com/dev_munachi"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"></path></svg></a>
    <a target="_blank" rel="noopener noreferrer" aria-label="GitHub" href="https://github.com/munachi821"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg></a>
    <a target="_blank" rel="noopener noreferrer" aria-label="TikTok" href="https://www.tiktok.com/@dev_muna"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg></a>
</div>
"""

def wordmark():
    letters = "".join(f"<span>{ch}</span>" for ch in "MUNACHI")
    return f"""
<div class="section wordmark" id="wordmark">
    <div class="wordmark-text">
        <span class="sr-only">MUNACHI</span>
        <span class="wordmark-letters" aria-hidden="true">{letters}</span>
    </div>
</div>
"""


def contact_section(root):
    return f"""
{wordmark()}
<div class="section contact" id="contact">
    <div>
        <p class="eyebrow">Let's talk</p>
        <h2>Let's build something.</h2>
        <div class="rule"></div>
        <p class="contact-lead">I'm currently open to frontend work — SaaS, fintech, edutech, or anything that needs real attention to detail.<br>If that's you, reach out.</p>
        <button class="btn-copy" type="button" data-copy-email>
            <span class="fill"></span>
            {COPY_ICON}
            <span data-copy-label>Copy Email</span>
        </button>
    </div>
    <div class="contact-foot">
        <div class="copyright">© 2026 Munachi Onyebuchi.</div>
        {SOCIALS}
    </div>
</div>
"""

def window(img, alt, root, live=None, zoom=False, url=None):
    src = root + "images/" + img
    live_html = ""
    if live and not zoom:
        live_html = f'<a class="window-live" href="{live}" target="_blank" rel="noopener noreferrer"><span>Visit Live Site</span></a>'
    zoom_attr = f' data-zoom="{src}"' if zoom else ""
    hint = f'<div class="zoom-hint"><span>{SEARCH_ICON} Click to Zoom</span></div>' if zoom else ""
    cls = "window zoom-shot" if zoom else "window"
    bar_url = url or (live if zoom else None)
    url_html = f'<span class="window-url">{bar_url}</span>' if bar_url else ""
    return f"""
<div class="{cls}"{zoom_attr}>
    <div class="window-bar"><div class="dot"></div><div class="dot"></div><div class="dot"></div>{url_html}</div>
    <div class="window-body"><img src="{src}" alt="{alt}"></div>
    {hint}
    {live_html}
</div>
"""

tech = json.load(open("/tmp/project-tech.json"))

PROJECTS = [
    {
        "slug": "campuspadi",
        "name": "Campuspadi",
        "tags": "Co-Founder · Fintech · Edutech",
        "logo": "campuspadi-logo.png",
        "shot": "campuspadi-dash.png",
        "live": "https://campuspadi.com",
        "blurb": "Started as a way to fix a real problem at ESUT — messy class fee collection and no easy way to track CGPA. CampusPadi now handles both, plus a study layer, and has been live for over a year.",
        "tech": tech[0],
        "category": "Co-Founder · Fintech · Edutech",
        "event": None,
        "deliverables": ["Product Strategy", "Payment Collection Systems", "CGPA Calculation Engine", "Mobile Web Client"],
        "technologies": ["React.js", "TypeScript", "Laravel", "PHP", "Tailwind CSS", "AI Integrations (Gemini, NVIDIA NIM, Groq)"],
        "overview_p": "CampusPadi is an all-in-one digital ecosystem built to resolve daily academic and administrative friction for university students. The platform replaces unorganized chat groups and paper records with four specialized interfaces:",
        "overview_li": [
            ("Class Dues Collection", "A student-led payment portal facilitating class levy deposits, transaction receipt generation, and real-time ledger audits."),
            ("Academic Progress Dashboard", "A personalized space for automated CGPA calculators, GPA trackers, and semester goal logs."),
            ("Shared Resource Vault", "A peer-to-peer library hosting downloadable lectures, past questions, and course-specific reading materials."),
            ("AI Study Assistant", "Integrated LLM chat interfaces for parsing class slides, summarizing long research, and generating quiz prep sheets."),
        ],
        "engineered_p": "As Co-Founder and Lead Frontend Developer, I spearheaded the client-side design and integration. Key engineering contributions included:",
        "engineered_li": [
            ("Financial Dashboard UI", "Designed and built secure payment confirmation sheets, visual revenue tracking graphs for class treasurers, and transaction logs."),
            ("Client-Side Math Engine", "Developed the automated CGPA/GPA calculation utilities in TypeScript, verifying score schemas to avoid rounding errors during dynamic GPA recalculations."),
            ("Resource Delivery Pipeline", "Optimized resource download sheets, integrating visual loader states, file size limits, and WebP previews for course materials."),
            ("LLM Chat Interface", "Styled and integrated the custom chat interface using Gemini, NVIDIA NIM, and Groq SDKs to stream AI tutor responses."),
        ],
        "lessons": [
            ("Latent Network Resilience", "Low-bandwidth campus cellular networks caused page loads to stall. I resolved this by caching critical page data in LocalStorage, implementing offline-first routing fallbacks, and rendering progressive skeletons to improve perceived performance."),
            ("Numeric Precision in GPA Logs", "Floating-point precision errors in JavaScript led to incorrect GPA displays. I solved this by implementing decimal scaling algorithms to normalize grade math before outputting GPA values, ensuring database accuracy."),
        ],
        "shots": [
            "campus_screenshot_1.0nwv1hp-7j3h6.png",
            "campus_screenshot_2.30vinzsueylcu.png",
            "campus_screenshot_3.371wqonphwzzb.png",
            "campus_screenshot_4.1strz73i-jzhb.png",
            "campus_screenshot_5.213lkoox2d274.png",
            "campus_screenshot_6.3uicjw16lncpr.png",
            "campus_screenshot_7.0_oxtp3k705ib.png",
            "campus_screenshot_8.0epqza_zt5-t6.png",
            "campus_screenshot_9.0ill6jwhk7bb_.png",
        ],
        "prev": ("unsaid", "Unsaid"),
        "next": ("agrotrack", "Agrotrack"),
    },
    {
        "slug": "agrotrack",
        "name": "Agrotrack",
        "tags": "Frontend · Agritech · Hardware",
        "logo": "agrotrack-logo.png",
        "shot": "agrotrack-dash.png",
        "live": "https://agrotrack-app.web.app/",
        "blurb": "A smart agritech platform that reduces conflicts between farmers and herders — using geofencing to define grazing zones and alert farmers the moment animals enter their farmland.",
        "tech": tech[1],
        "category": "Frontend · Agritech · Hardware",
        "event": "Enugu Campus Hackathon - Top 11 finalist",
        "deliverables": ["IoT Hardware Integration", "Geofencing Engine", "Real-time Alerts Dashboard", "Interactive Map UI"],
        "technologies": ["React.js", "Node.js", "Tailwind CSS", "Firebase", "TTGO T-Call with SIM800L", "ESP32", "NEO8M GPS", "Leaflet Maps API", "AI Integrations"],
        "overview_p": "Agrotrack is an IoT-powered geofencing platform designed to reduce conflict between farmers and livestock herders. It integrates physical tracking hardware with a digital mapping system to protect agricultural zoning:",
        "overview_li": [
            ("Virtual Farmland Geofences", "Custom virtual boundaries created by farmers to monitor perimeter safety around crop zones."),
            ("Live Telemetry Stream", "Real-time map displaying GPS coordinates of grazing herds next to protected farm zones."),
            ("Instant Perimeter Alerts", "Automated SMS/push notification triggers dispatched to farmers and herders the moment livestock cross a geofence."),
            ("Hardware Node Sync", "Low-power ESP32 microcontrollers with GPS modules sending coordinates to the cloud via cellular nodes."),
        ],
        "engineered_p": "I engineered the mapping visualization and real-time data sync pipeline. Key contributions included:",
        "engineered_li": [
            ("Interactive Geospatial Layer", "Built a responsive, vector-based rendering layer with Leaflet and React to project complex geofences and path histories without lagging the DOM."),
            ("Telemetry Sync Loop", "Connected real-time database updates from IoT hardware (ESP32/SIM800L GPS) to the frontend, utilizing debounce algorithms to prevent map stutter."),
            ("Alert Event Triggers", "Set up serverless function endpoints to process incoming location payloads, calculate intersections, and queue immediate SMS alerts."),
        ],
        "lessons": [
            ("High-Frequency Rendering Lag", "Drawing dozens of active GPS tracks and multi-point geofence boundaries caused major browser reflow bottlenecks. I optimized this by implementing canvas-based map rendering rather than SVG DOM elements, cutting rendering time by 75%."),
            ("Latent GPS Telemetry", "Fluctuating cellular signals in remote areas sent duplicate or delayed GPS packages. I resolved this by coding a temporal-distance filter on the backend to verify coordinate velocity before updating the live map."),
        ],
        "shots": [
            "agrotrack_screenshot_1.3__f9dh5aj8vh.png",
            "agrotrack_screenshot_2.11qu_gylnk7nu.png",
            "agrotrack_screenshot_3.0v2s2ia5dh-40.png",
            "agrotrack_screenshot_4.0a36_yokuyxhq.png",
            "agrotrack_screenshot_5.3dtly4pgjvq9a.png",
        ],
        "prev": ("campuspadi", "Campuspadi"),
        "next": ("tabletap", "Table-Tap"),
    },
    {
        "slug": "tabletap",
        "name": "Table-Tap",
        "tags": "Fullstack · SaaS · B2B",
        "logo": None,
        "shot": "tabletap-dash.png",
        "live": "https://table-tap-cyan.vercel.app/",
        "blurb": "A multi-tenant restaurant ordering and Kitchen Display System built on Supabase. One unified codebase reliably serves isolated environments for multiple restaurants.",
        "tech": tech[2],
        "category": "Fullstack · SaaS · B2B",
        "event": None,
        "deliverables": ["Multi-Tenant DB Architecture", "QR-Code Ordering System", "Kitchen Display (KDS) Interface", "Real-time Order Streams"],
        "technologies": ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Paystack", "WebSockets"],
        "overview_p": "Table-Tap is a high-performance, multi-tenant SaaS platform designed to modernize restaurant operations. It bridges four user environments under a single deployment:",
        "overview_li": [
            ("Customer Ordering (/order)", "Scanning table QR codes to browse menu categories, pay instantly via Paystack, and place orders."),
            ("Kitchen Display (/kitchen)", "Real-time, touch-optimized order board for kitchen staff to coordinate and track orders."),
            ("Restaurant Dashboard (/admin)", "Managing menu items, categories, viewing live analytics, and provisioning credentials."),
            ("Super Admin Governance (/myadmin)", "Platform control panel (God Mode) to toggle paywalls, adjust pricing, and suspend tenants globally."),
        ],
        "engineered_p": "I designed and developed the fullstack architecture using Next.js and Supabase. Key contributions included:",
        "engineered_li": [
            ("Secure Billing Loop", "Connected client-side Paystack payment flows with Next.js Server Action verification. Validated transaction callbacks via HMAC SHA512 signatures and promoted order status in the database using a secure Supabase Admin Client."),
            ("Two-Layer Security & AuthGuard", "Created an edge-to-client guard system. Next.js Middleware verifies session cookies at the server edge, while a custom React AuthGuard performs deep, deferred checks for subscription validity and tenant suspension."),
            ("Real-time Order Streams", "Configured Supabase Realtime WS channels to stream PostgreSQL data changes directly to kitchen touchscreens, keeping order feeds perfectly synchronized."),
        ],
        "lessons": [
            ("Decoupling Security for Performance", "Running tenant verification queries in global Edge Middleware added heavy latency to page assets. I split the routing security layers so edge middleware only handles quick token refreshes, and the heavy database check runs inside the React AuthGuard shell."),
            ("Preventing Transaction Spoofing", "To prevent users from editing database order states manually, I forced the client to create 'PENDING' records, leaving status promotion to a secured webhook endpoint backed by cryptographic signature verification and database idempotency checks."),
            ("Optimistic Credential Write", "Listing all platform users to ensure uniqueness when provisioning device credentials created latency. I restructured the flow to write the record first, intercept duplicate key exceptions, and fallback to updating passwords, cutting database roundtrips to a single path."),
        ],
        "shots": [
            "tabletap_screenshot_1.0ulkm-79brhq6.png",
            "tabletap_screenshot_2.180ponkfavc3s.png",
            "tabletap_screenshot_3.0bq99kuetub1w.png",
            "tabletap_screenshot_4.11spg10f04ivd.png",
            "tabletap_screenshot_5.3ol_z8icme44g.png",
            "tabletap_screenshot_6.3mxxa4dwj9s_h.png",
            "tabletap_screenshot_7.1l-asd8oc_ukf.png",
            "tabletap_screenshot_8.1z4gscxq17jwy.png",
            "tabletap_screenshot_9.3bqaqxccfp56h.png",
            "tabletap_screenshot_10.1sbq58ju6x4t1.png",
        ],
        "prev": ("agrotrack", "Agrotrack"),
        "next": ("unsaid", "Unsaid"),
    },
    {
        "slug": "unsaid",
        "name": "Unsaid",
        "tags": "Fullstack · Social · Anonymity",
        "logo": "unsaid-logo.png",
        "shot": "unsaid-dash.png",
        "live": "https://the-unsaid.vercel.app/",
        "blurb": "An anonymous social platform where users can securely share their unspoken thoughts. Engineered to handle both text and image-based confessions in a completely untraceable, minimalist environment.",
        "tech": tech[3],
        "category": "Fullstack · Social · Anonymity",
        "event": None,
        "deliverables": ["Confession Submission Engine", "Image Upload Hosting", "Minimalist Feed UI", "Data Privacy Hardening"],
        "technologies": ["Coming soon"],
        "overview_p": "Unsaid is a minimalist, anonymous social sharing space designed for raw self-expression and confessions. The platform operates on absolute anonymity and responsive micro-interactions:",
        "overview_li": [
            ("Public Confessions Feed", "A completely untraceable chronological feed featuring anonymized textual and visual cards."),
            ("Minimalist Post Creator", "An interface where users submit confessions alongside optional media assets without accounts or IP logging."),
            ("Interactive Reactions", "Engagement loops allowing users to interact with posts using pre-defined anonymous emotions."),
        ],
        "engineered_p": "I built the entire web app and engineered the data-anonymization architecture. Key contributions included:",
        "engineered_li": [
            ("Absolute Privacy Pipeline", "Decoupled post creations from user-identifiable data, stripping IP addresses, request headers, and metadata at the api endpoint before writing records."),
            ("Optimized Media Store", "Integrated client-side WebP compression and Supabase storage to process, optimize, and host confessions images under a 1MB limit for quick page load times."),
            ("Dark Mode Aesthetic", "Crafted a high-contrast dark theme with Framer Motion transitions for smooth feed interactions and content loading."),
        ],
        "lessons": [
            ("Preventing Identity Leakage", "Traditional relational schemas risk connecting posts to accounts through trace logs. I restructured the database to store user sessions in ephemeral localStorage tokens and separated authentication states from post records entirely."),
            ("Image Load Performance", "Loading raw image uploads on infinite-scroll confession feeds caused high layout shift and network latency. I resolved this by pre-compressing images to next-gen WebP formats on the client and serving them using Next.js Image optimization and BlurHash placeholders."),
        ],
        "shots": [
            "unsaid_screenshot_1.20rypkba7_-nw.png",
            "unsaid_screenshot_2.0q66soqwyjm42.png",
            "unsaid_screenshot_3.3dq74l3dba34s.png",
            "unsaid_screenshot_4.069iqurozyx_c.png",
            "unsaid_screenshot_5.0t7tga8ncs-vu.png",
        ],
        "prev": ("tabletap", "Table-Tap"),
        "next": ("campuspadi", "Campuspadi"),
    },
]


def project_card(p, root, show_live=False):
    logo = f'<img src="{root}images/{p["logo"]}" alt="{p["name"]} logo">' if p["logo"] else ""
    live = p["live"] if show_live else None
    techs = "".join(p["tech"])
    href = root + "projects/" + p["slug"] + ".html"
    return f"""
<article class="project">
    {window(p["shot"], p["name"] + " screenshot", root, live=live)}
    <div class="project-meta">
        <div class="project-id">
            <p class="project-tags">{p["tags"]}</p>
            <div class="project-name">{logo}<h3>{p["name"]}</h3></div>
        </div>
        <div class="project-copy">
            <p>{p["blurb"]}</p>
            <div class="project-links">
                <div class="tech-row">{techs}</div>
                <a class="link-view" href="{href}"><span>View Project</span> {ARROW_RIGHT}</a>
            </div>
        </div>
    </div>
</article>
"""


def toolkit_row():
    t = json.load(open("/tmp/toolkit.json"))
    html = open("/home/user/inspect/home.html").read()
    idx = html.find('title="Github"')
    gh = re.search(r"<svg[\s\S]*?</svg>", html[idx:]).group(0)
    gh = re.sub(r' class="[^"]*"', "", gh)
    order = ["HTML5", "React", "Next.js", "Tailwind CSS", "CSS", "Figma", "Supabase", "JavaScript", "Vercel", "Netlify", "Railway", "TypeScript"]
    bits = []
    for name in order:
        inner = t[name]
        bits.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" title="{name}">{inner}</svg>')
    bits.append(gh.replace("<svg", '<svg title="Github"'))
    row = "\n".join(bits)
    return row + row  # duplicate for seamless loop


def write_index():
    root = ""
    tk = toolkit_row()
    cards = "\n".join(project_card(p, root, show_live=False) for p in PROJECTS)
    html = ROOT_HEAD.format(
        title="Munachi Onyebuchi | Frontend Developer — React, Next.js, TypeScript",
        desc="I build fast, clean interfaces for SaaS and fintech products — crafted with care, shipped with confidence.",
        root=root,
        page="home",
    ) + f"""
<div class="section hero" id="home">
    <div class="hero-photo reveal"><img src="images/photo.webp" alt="Munachi"></div>
    <div class="hero-copy reveal">
        <h1>Kedu,<br>I'm Munachi, a Frontend Developer</h1>
        <p class="hero-lead">I build fast, clean interfaces for SaaS and fintech products — crafted with care, shipped with confidence.</p>
    </div>
    <div class="hero-actions reveal">
        <a href="mailto:munaonye4@gmail.com">
            <span class="btn-pill">
                <span class="ripple"></span>
                <span class="btn-label">Work with me</span>
                <span class="btn-icon">{ARROW_NE}</span>
            </span>
        </a>
        <a class="link-work" href="#projects">View my work {ARROW_DOWN}</a>
    </div>
</div>

<div class="section about" id="about">
    <div class="about-title">
        <h2>About Me</h2>
        <div class="rule"></div>
    </div>
    <div class="about-body">
        <div class="about-text">
            <p>Co-founder of <span class="brand-inline"><img src="images/campuspadi-logo.png" alt="campuspadi">CampusPadi</span>, a platform helping students manage fees and study better.</p>
            <p>I'm <strong>Munachi Onyebuchi</strong>, a self-taught frontend developer with 2+ years of experience, studying Computer Science at ESUT, based in Enugu.</p>
            <p>I have a low tolerance for bad UX — a slow page, a confusing flow, a button that doesn't respond right — and that impatience is exactly why I care so much about the details most people skip: hover states, spacing, load times, the small stuff that separates "it works" from "it feels considered."</p>
            <p>Outside of client work, you'll usually find me in the middle of a hackathon, arguing about a color palette, or rebuilding something I already finished because I found a better way to do it.</p>
        </div>
        <div class="toolkit">
            <p class="toolkit-label">The Toolkit</p>
            <div class="toolkit-track-wrap">
                <div class="toolkit-track">{tk}</div>
            </div>
        </div>
    </div>
</div>

<div class="section projects" id="projects">
    <div class="projects-head">
        <h2>Things I've shipped</h2>
        <div class="rule"></div>
    </div>
    <div class="project-list">
        {cards}
    </div>
    <div class="projects-more">
        <a href="projects/index.html">
            <span class="btn-pill">
                <span class="ripple"></span>
                <span class="btn-label">View All Projects</span>
                <span class="btn-icon">{ARROW_NE}</span>
            </span>
        </a>
    </div>
</div>

{contact_section(root)}
""" + FOOT.format(root=root)
    open("/home/user/site/index.html", "w").write(html)


def write_projects_index():
    root = "../"
    cards = "\n".join(project_card(p, root, show_live=True) for p in PROJECTS)
    html = ROOT_HEAD.format(
        title="Projects — Munachi Onyebuchi",
        desc="A collection of products I've designed and built.",
        root=root,
        page="projects",
    ) + f"""
<div class="page-top">
    <a class="back" href="../index.html">{BACK_ICON} Back home</a>
    <div>
        <h2 class="projects-head" style="margin:0">Things I've shipped</h2>
        <div class="rule"></div>
        <p class="page-intro">A collection of products I've designed and built — from co-founding a fintech platform to engineering AI voice agents. Each one taught me something new.</p>
    </div>
</div>
<div class="section projects" id="projects">
    <div class="project-list">{cards}</div>
</div>
{contact_section(root)}
""" + FOOT.format(root=root)
    open("/home/user/site/projects/index.html", "w").write(html)


def lis(items):
    out = ["<ul>"]
    for title, body in items:
        out.append(f"<li><strong>{title}:</strong> {body}</li>")
    out.append("</ul>")
    return "\n".join(out)


def write_case(p):
    root = "../"
    logo = f'<img src="{root}images/{p["logo"]}" alt="{p["name"]} logo">' if p["logo"] else ""
    techs = "".join(p["tech"])
    chips = "".join(f'<span class="chip">{t}</span>' for t in p["technologies"])
    dels = "".join(f"<li>{d}</li>" for d in p["deliverables"])
    event = ""
    if p["event"]:
        event = f"""<div class="side-block"><h3>Event / Achievement</h3><p>{p["event"]}</p></div>"""
    shots = "\n".join(
        f'<div class="shot-card" data-zoom="{root}images/{s}"><img src="{root}images/{s}" alt="{p["name"]} screenshot"></div>'
        for s in p["shots"]
    )
    html = ROOT_HEAD.format(
        title=f"{p['name']} — Munachi Onyebuchi",
        desc=p["blurb"],
        root=root,
        page="case",
    ) + f"""
<div class="page-top">
    <a class="back" href="index.html">{BACK_ICON} Back</a>
</div>
<div class="section case-hero">
    <p class="project-tags">{p["tags"]}</p>
    <div class="case-heading">
        <div class="case-brand">{logo}<h1>{p["name"]}</h1></div>
        <a class="btn-live" href="{p["live"]}" target="_blank" rel="noopener noreferrer">Visit Live Site {EXT_ICON}</a>
    </div>
    <p class="case-lead">{p["blurb"]}</p>
    <div class="built-with">Built with {techs}</div>
    {window(p["shot"], p["name"] + " screenshot", root, live=p["live"], zoom=True)}
</div>

<div class="section case-grid">
    <aside class="case-side">
        <div class="side-block"><h3>Category</h3><p>{p["category"]}</p></div>
        {event}
        <div class="side-block"><h3>Deliverables</h3><ul>{dels}</ul></div>
        <div class="side-block"><h3>Technologies</h3><div class="chips">{chips}</div></div>
        <div class="side-block"><h3>Live Product</h3><a class="side-link" href="{p["live"]}" target="_blank" rel="noopener noreferrer">Visit Application {EXT_ICON}</a></div>
    </aside>
    <div class="case-main">
        <div>
            <h2>Overview &amp; Context</h2>
            <p>{p["overview_p"]}</p>
            {lis(p["overview_li"])}
        </div>
        <div>
            <h2>What I Engineered</h2>
            <p>{p["engineered_p"]}</p>
            {lis(p["engineered_li"])}
        </div>
        <div>
            <h2>Challenges &amp; Lessons</h2>
            {lis(p["lessons"])}
        </div>
    </div>
</div>

<div class="shots">
    <div class="shots-head">
        <h2>Product Screenshots</h2>
        <div class="shots-nav">
            <button type="button" data-shots-prev aria-label="Scroll left">{BACK_ICON}</button>
            <button type="button" data-shots-next aria-label="Scroll right">{EXT_ICON}</button>
        </div>
    </div>
    <div class="shots-row">{shots}</div>
</div>

<div class="pager">
    <a href="{p["prev"][0]}.html">
        <span class="label">{BACK_ICON} Previous Project</span>
        <span class="name">{p["prev"][1]}</span>
    </a>
    <a class="next" href="{p["next"][0]}.html">
        <span class="label">Next Project {EXT_ICON}</span>
        <span class="name">{p["next"][1]}</span>
    </a>
</div>

{contact_section(root)}
""" + FOOT.format(root=root)
    open(f"/home/user/site/projects/{p['slug']}.html", "w").write(html)


write_index()
write_projects_index()
for p in PROJECTS:
    write_case(p)
print("wrote pages")
