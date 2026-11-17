export const SUPPORTED_LOCALES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸", currency: "USD" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧", currency: "GBP" },
  { code: "nl-NL", label: "Nederlands", flag: "🇳🇱", currency: "EUR" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷", currency: "EUR" },
  { code: "zh-CN", label: "简体中文", flag: "🇨🇳", currency: "CNY" },
  { code: "da-DK", label: "Dansk", flag: "🇩🇰", currency: "DKK" },
  { code: "ja-JP", label: "日本語", flag: "🇯🇵", currency: "JPY" },
  { code: "hi-IN", label: "हिन्दी", flag: "🇮🇳", currency: "INR" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const messages = {
  "en-US": {
    navProduct: "Product", navHow: "How it works", navPricing: "Pricing", login: "Log in", start: "Start for free",
    eyebrow: "THE SIMPLE WAY TO CLOSE CLIENT DEALS",
    title: "Win the deal. Sign the agreement. Get to work.",
    subtitle: "Create polished proposals, collect legally appropriate electronic signatures, and gather client documents in one secure workspace. One simple link keeps everyone moving.",
    primary: "Create your first deal", secondary: "See how it works",
    trust: "No credit card required · Set up in minutes · Built for teams of every size",
    preview: "YOUR CLIENT DEAL ROOM", previewTitle: "Brand identity & website project", prepared: "Prepared for Acme Studio",
    investment: "Project total", review: "Review", sign: "Sign", upload: "Share files",
    sectionLabel: "FROM FIRST DRAFT TO SIGNED DEAL", sectionTitle: "Everything needed to move work forward.",
    feature1: "AI-assisted proposals", feature1d: "Turn a brief into a clear proposal and scope of work. You stay in control of every detail.",
    feature2: "A simple signing experience", feature2d: "Give clients one easy place to review the agreement and complete the signing flow.",
    feature3: "Client document collection", feature3d: "Request the files you need and keep each deal's documents organised in one place.",
    howTitle: "A smoother way to do business.", how1: "Create", how1d: "Add the client, project scope, price and documents you need.", how2: "Share", how2d: "Send one private link. Your client can review everything in one place.", how3: "Move forward", how3d: "Collect the agreed acceptance and files, then start the work.",
    pricingEyebrow: "SIMPLE, TRANSPARENT PRICING", pricingTitle: "Start free. Keep costs low as you grow.", pricingCopy: "Use the essentials first. Upgrade only when your business needs more. No surprise add-ons.",
    free: "Free", freePrice: "$0", freeDesc: "For trying the complete workflow.", freeCta: "Get started free",
    fair: "Affordable plans", fairPrice: "Coming soon", fairDesc: "Straightforward pricing designed for freelancers and growing teams.", fairCta: "No commitment",
    pricingNote: "Final plan limits and regional prices will be published before paid subscriptions launch.",
    globalTitle: "Work across borders, in your language.", globalCopy: "Choose your language. We format dates, numbers and currencies for your region. More languages and local payment options will be added as we expand.",
    footerLine: "AI-assisted proposals · Client agreements · Document collection",
    copyright: "© {year} SignDealDocs. All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact",
  },
  "en-GB": {
    navProduct:"Product",navHow:"How it works",navPricing:"Pricing",login:"Log in",start:"Start for free",eyebrow:"THE SIMPLE WAY TO CLOSE CLIENT DEALS",
    title:"Win the deal. Sign the agreement. Get to work.",subtitle:"Create polished proposals, collect appropriate electronic signatures, and gather client documents in one secure workspace. One simple link keeps everyone moving.",
    primary:"Create your first deal",secondary:"See how it works",trust:"No credit card required · Set up in minutes · Built for teams of every size",preview:"YOUR CLIENT DEAL ROOM",previewTitle:"Brand identity & website project",prepared:"Prepared for Acme Studio",investment:"Project total",review:"Review",sign:"Sign",upload:"Share files",
    sectionLabel:"FROM FIRST DRAFT TO SIGNED DEAL",sectionTitle:"Everything needed to move work forward.",feature1:"AI-assisted proposals",feature1d:"Turn a brief into a clear proposal and scope of work. You stay in control.",feature2:"A simple signing experience",feature2d:"Give clients one easy place to review the agreement and complete the signing flow.",feature3:"Client document collection",feature3d:"Request the files you need and keep each deal's documents organised.",
    howTitle:"A smoother way to do business.",how1:"Create",how1d:"Add the client, project scope, price and documents you need.",how2:"Share",how2d:"Send one private link. Your client can review everything in one place.",how3:"Move forward",how3d:"Collect the agreed acceptance and files, then start the work.",
    pricingEyebrow:"SIMPLE, TRANSPARENT PRICING",pricingTitle:"Start free. Keep costs low as you grow.",pricingCopy:"Use the essentials first. Upgrade only when your business needs more. No surprise add-ons.",free:"Free",freePrice:"£0",freeDesc:"For trying the complete workflow.",freeCta:"Get started free",fair:"Affordable plans",fairPrice:"Coming soon",fairDesc:"Straightforward pricing designed for freelancers and growing teams.",fairCta:"No commitment",pricingNote:"Final plan limits and regional prices will be published before paid subscriptions launch.",
    globalTitle:"Work across borders, in your language.",globalCopy:"Choose your language. We format dates, numbers and currencies for your region. More languages and local payment options will be added as we expand.",
    footerLine:"AI-assisted proposals · Client agreements · Document collection",copyright:"© {year} SignDealDocs. All rights reserved.",privacy:"Privacy",terms:"Terms",contact:"Contact"
  },
  "nl-NL": {
    navProduct:"Product",navHow:"Zo werkt het",navPricing:"Prijzen",login:"Inloggen",start:"Gratis starten",eyebrow:"DE EENVOUDIGE MANIER OM KLANTDEALS TE SLUITEN",
    title:"Win de opdracht. Onderteken de overeenkomst. Ga aan de slag.",subtitle:"Maak professionele voorstellen, verzamel elektronische handtekeningen en ontvang klantdocumenten in één beveiligde werkruimte. Eén eenvoudige link houdt alles in beweging.",
    primary:"Maak je eerste deal",secondary:"Bekijk hoe het werkt",trust:"Geen creditcard nodig · Binnen enkele minuten ingesteld · Voor teams van elke omvang",preview:"JOUW KLANTOMGEVING",previewTitle:"Huisstijl- en websiteproject",prepared:"Opgesteld voor Acme Studio",investment:"Projecttotaal",review:"Bekijken",sign:"Ondertekenen",upload:"Bestanden delen",
    sectionLabel:"VAN EERSTE CONCEPT TOT ONDERTEKENDE DEAL",sectionTitle:"Alles om projecten vooruit te helpen.",feature1:"Voorstellen met AI-ondersteuning",feature1d:"Zet een briefing om in een helder voorstel en projectomvang. Jij houdt de controle.",feature2:"Eenvoudig ondertekenen",feature2d:"Geef klanten één plek om de overeenkomst te bekijken en te ondertekenen.",feature3:"Documenten van klanten verzamelen",feature3d:"Vraag benodigde bestanden op en houd documenten per deal overzichtelijk bij.",
    howTitle:"Zakendoen wordt eenvoudiger.",how1:"Aanmaken",how1d:"Voeg de klant, projectomvang, prijs en benodigde documenten toe.",how2:"Delen",how2d:"Verstuur één privélink. Je klant bekijkt alles op één plek.",how3:"Verdergaan",how3d:"Verzamel de bevestiging en bestanden en start het werk.",
    pricingEyebrow:"EENVOUDIGE, TRANSPARANTE PRIJZEN",pricingTitle:"Begin gratis. Houd de kosten laag terwijl je groeit.",pricingCopy:"Begin met de basis. Upgrade alleen wanneer je bedrijf meer nodig heeft.",free:"Gratis",freePrice:"€0",freeDesc:"Om de volledige workflow uit te proberen.",freeCta:"Gratis starten",fair:"Betaalbare abonnementen",fairPrice:"Binnenkort",fairDesc:"Duidelijke prijzen voor freelancers en groeiende teams.",fairCta:"Geen verplichtingen",pricingNote:"Definitieve abonnementen en regionale prijzen worden gepubliceerd vóór de start van betaalde abonnementen.",
    globalTitle:"Werk internationaal, in je eigen taal.",globalCopy:"Kies je taal. Datums, getallen en valuta worden aangepast aan je regio. Meer talen en lokale betaalmethoden volgen.",
    footerLine:"AI-ondersteunde voorstellen · Klantovereenkomsten · Documenten verzamelen",copyright:"© {year} SignDealDocs. Alle rechten voorbehouden.",privacy:"Privacy",terms:"Voorwaarden",contact:"Contact"
  },
  "fr-FR": {
    navProduct:"Produit",navHow:"Fonctionnement",navPricing:"Tarifs",login:"Connexion",start:"Commencer gratuitement",eyebrow:"LA FAÇON SIMPLE DE CONCLURE VOS CONTRATS",
    title:"Remportez le contrat. Signez l’accord. Lancez le projet.",subtitle:"Créez des propositions soignées, recueillez les signatures électroniques adaptées et rassemblez les documents clients dans un espace sécurisé. Un seul lien simplifie les échanges.",
    primary:"Créer mon premier contrat",secondary:"Voir le fonctionnement",trust:"Aucune carte bancaire · Configuration en quelques minutes · Pour toutes les équipes",preview:"VOTRE ESPACE CLIENT",previewTitle:"Identité de marque et site web",prepared:"Préparé pour Acme Studio",investment:"Total du projet",review:"Consulter",sign:"Signer",upload:"Partager des fichiers",
    sectionLabel:"DU PREMIER BROUILLON AU CONTRAT SIGNÉ",sectionTitle:"Tout ce qu’il faut pour faire avancer vos projets.",feature1:"Propositions assistées par l’IA",feature1d:"Transformez un brief en proposition claire et en périmètre de travail. Vous gardez le contrôle.",feature2:"Une signature simplifiée",feature2d:"Offrez à vos clients un espace unique pour consulter et signer l’accord.",feature3:"Collecte des documents clients",feature3d:"Demandez les fichiers nécessaires et organisez les documents de chaque contrat.",
    howTitle:"Une façon plus simple de travailler.",how1:"Créer",how1d:"Ajoutez le client, le périmètre, le prix et les documents nécessaires.",how2:"Partager",how2d:"Envoyez un lien privé. Votre client consulte tout au même endroit.",how3:"Avancer",how3d:"Recueillez l’accord et les fichiers, puis démarrez le projet.",
    pricingEyebrow:"DES TARIFS SIMPLES ET TRANSPARENTS",pricingTitle:"Commencez gratuitement. Maîtrisez vos coûts en grandissant.",pricingCopy:"Utilisez d’abord l’essentiel. Passez à une offre supérieure uniquement si nécessaire.",free:"Gratuit",freePrice:"0 €",freeDesc:"Pour découvrir le parcours complet.",freeCta:"Commencer gratuitement",fair:"Offres abordables",fairPrice:"Bientôt",fairDesc:"Des tarifs clairs pour les indépendants et les équipes en croissance.",fairCta:"Sans engagement",pricingNote:"Les limites et tarifs régionaux seront publiés avant le lancement des abonnements payants.",
    globalTitle:"Travaillez à l’international, dans votre langue.",globalCopy:"Choisissez votre langue. Les dates, nombres et devises s’adaptent à votre région. D’autres langues et moyens de paiement locaux arriveront progressivement.",
    footerLine:"Propositions assistées par l’IA · Accords clients · Collecte de documents",copyright:"© {year} SignDealDocs. Tous droits réservés.",privacy:"Confidentialité",terms:"Conditions",contact:"Contact"
  },
  "zh-CN": {
    navProduct:"产品",navHow:"使用方式",navPricing:"价格",login:"登录",start:"免费开始",eyebrow:"轻松完成客户签约",
    title:"赢得合作。签署协议。开始工作。",subtitle:"创建专业提案，收集适用的电子签名，并在安全的工作空间中接收客户文件。一个简单链接，让合作顺畅进行。",
    primary:"创建第一笔合作",secondary:"了解使用方式",trust:"无需信用卡 · 几分钟即可设置 · 适合各种规模的团队",preview:"您的客户工作空间",previewTitle:"品牌形象与网站项目",prepared:"为 Acme Studio 准备",investment:"项目总价",review:"查看",sign:"签署",upload:"分享文件",
    sectionLabel:"从初稿到签署完成",sectionTitle:"推动项目所需的一切工具。",feature1:"AI 辅助提案",feature1d:"将需求说明整理为清晰的提案和工作范围。所有细节由您掌控。",feature2:"简单的签署体验",feature2d:"让客户在一个页面查看协议并完成签署流程。",feature3:"收集客户文件",feature3d:"收集所需文件，并集中管理每笔合作的资料。",
    howTitle:"让业务合作更简单。",how1:"创建",how1d:"填写客户、项目范围、价格和所需文件。",how2:"分享",how2d:"发送一个私密链接，客户即可查看所有内容。",how3:"开始",how3d:"收集确认和文件，然后启动项目。",
    pricingEyebrow:"简单透明的价格",pricingTitle:"免费开始，随着业务增长控制成本。",pricingCopy:"先使用核心功能。只有在业务需要时再升级。",free:"免费",freePrice:"$0",freeDesc:"体验完整工作流程。",freeCta:"免费开始",fair:"实惠套餐",fairPrice:"即将推出",fairDesc:"为自由职业者和成长型团队设计的清晰价格。",fairCta:"无强制承诺",pricingNote:"付费订阅上线前将公布最终套餐限制和地区价格。",
    globalTitle:"使用熟悉的语言开展全球业务。",globalCopy:"选择语言。日期、数字和货币将根据您的地区格式显示。我们会逐步增加更多语言和本地支付方式。",
    footerLine:"AI 辅助提案 · 客户协议 · 文件收集",copyright:"© {year} SignDealDocs。保留所有权利。",privacy:"隐私",terms:"条款",contact:"联系"
  },
  "da-DK": {
    navProduct:"Produkt",navHow:"Sådan fungerer det",navPricing:"Priser",login:"Log ind",start:"Start gratis",eyebrow:"DEN ENKLE MÅDE AT LUKKE KUNDEAFTALER PÅ",
    title:"Vind aftalen. Underskriv. Kom i gang.",subtitle:"Opret professionelle tilbud, indhent relevante elektroniske underskrifter og modtag kundedokumenter i ét sikkert arbejdsområde. Ét enkelt link holder processen i gang.",
    primary:"Opret din første aftale",secondary:"Se hvordan det fungerer",trust:"Intet betalingskort · Klar på få minutter · Til teams i alle størrelser",preview:"DIT KUNDEOMRÅDE",previewTitle:"Brandidentitet og websiteprojekt",prepared:"Udarbejdet til Acme Studio",investment:"Projektpris",review:"Gennemgå",sign:"Underskriv",upload:"Del filer",
    sectionLabel:"FRA FØRSTE UDKAST TIL UNDERSKREVET AFTALE",sectionTitle:"Alt, hvad du skal bruge for at komme videre.",feature1:"AI-assisterede tilbud",feature1d:"Gør en opgavebeskrivelse til et klart tilbud og en arbejdsbeskrivelse. Du har kontrollen.",feature2:"En enkel underskriftsoplevelse",feature2d:"Giv kunderne ét sted, hvor de kan gennemgå og underskrive aftalen.",feature3:"Indsamling af kundedokumenter",feature3d:"Bed om de nødvendige filer, og hold dokumenterne for hver aftale samlet.",
    howTitle:"En enklere måde at drive forretning på.",how1:"Opret",how1d:"Tilføj kunden, opgaven, prisen og de nødvendige dokumenter.",how2:"Del",how2d:"Send ét privat link. Kunden kan se alt samlet ét sted.",how3:"Kom videre",how3d:"Indhent accept og filer, og start derefter arbejdet.",
    pricingEyebrow:"ENKLE OG GENNEMSIGTIGE PRISER",pricingTitle:"Start gratis. Hold omkostningerne nede, mens du vokser.",pricingCopy:"Begynd med det vigtigste. Opgrader kun, når virksomheden har brug for mere.",free:"Gratis",freePrice:"0 kr.",freeDesc:"Til afprøvning af hele arbejdsgangen.",freeCta:"Start gratis",fair:"Prisvenlige planer",fairPrice:"Kommer snart",fairDesc:"Enkle priser til freelancere og teams i vækst.",fairCta:"Ingen binding",pricingNote:"Endelige abonnementsgrænser og lokale priser offentliggøres før lanceringen.",
    globalTitle:"Arbejd på tværs af grænser på dit eget sprog.",globalCopy:"Vælg sprog. Datoer, tal og valuta formateres efter din region. Flere sprog og lokale betalingsmuligheder kommer løbende.",
    footerLine:"AI-assisterede tilbud · Kundeaftaler · Dokumentindsamling",copyright:"© {year} SignDealDocs. Alle rettigheder forbeholdes.",privacy:"Privatliv",terms:"Vilkår",contact:"Kontakt"
  },
  "ja-JP": {
    navProduct:"製品",navHow:"使い方",navPricing:"料金",login:"ログイン",start:"無料で始める",eyebrow:"顧客との契約をもっとシンプルに",
    title:"案件を獲得し、契約に署名して、仕事を始めましょう。",subtitle:"見やすい提案書を作成し、適切な電子署名を受け取り、顧客の書類を安全なワークスペースに集約できます。共有リンクひとつで手続きをスムーズにします。",
    primary:"最初の案件を作成",secondary:"使い方を見る",trust:"クレジットカード不要 · 数分で設定 · あらゆる規模のチームに対応",preview:"顧客専用ワークスペース",previewTitle:"ブランドデザイン・ウェブサイト制作",prepared:"Acme Studio 向け",investment:"プロジェクト合計",review:"確認",sign:"署名",upload:"ファイル共有",
    sectionLabel:"最初の提案から契約締結まで",sectionTitle:"仕事を前に進めるために必要な機能をひとつに。",feature1:"AIによる提案書作成支援",feature1d:"依頼内容から明確な提案書と作業範囲を作成。最終的な内容はあなたが管理します。",feature2:"シンプルな署名体験",feature2d:"顧客がひとつの画面で契約内容を確認し、署名できるようにします。",feature3:"顧客書類の収集",feature3d:"必要なファイルを依頼し、案件ごとに整理して保管できます。",
    howTitle:"ビジネスをもっとスムーズに。",how1:"作成",how1d:"顧客、作業範囲、料金、必要書類を入力します。",how2:"共有",how2d:"専用リンクを送信。顧客はひとつの場所ですべて確認できます。",how3:"開始",how3d:"同意と必要書類を受け取り、プロジェクトを開始します。",
    pricingEyebrow:"シンプルで明確な料金",pricingTitle:"無料で始めて、成長に合わせて低コストを維持。",pricingCopy:"まずは基本機能から。必要になったときだけアップグレードできます。",free:"無料",freePrice:"$0",freeDesc:"ワークフロー全体をお試しいただけます。",freeCta:"無料で始める",fair:"お手頃なプラン",fairPrice:"近日公開",fairDesc:"フリーランスや成長中のチーム向けのわかりやすい料金体系。",fairCta:"契約義務なし",pricingNote:"有料プラン開始前に、利用上限と地域別料金を公開します。",
    globalTitle:"使い慣れた言語で、世界中の顧客と仕事を。",globalCopy:"言語を選択すると、日付・数値・通貨を地域に合わせて表示します。対応言語と地域決済は順次追加します。",
    footerLine:"AI提案書 · 顧客契約 · 書類収集",copyright:"© {year} SignDealDocs. All rights reserved.",privacy:"プライバシー",terms:"利用規約",contact:"お問い合わせ"
  },
  "hi-IN": {
    navProduct:"प्रोडक्ट",navHow:"कैसे काम करता है",navPricing:"कीमत",login:"लॉग इन",start:"मुफ़्त शुरू करें",eyebrow:"क्लाइंट डील पूरी करने का आसान तरीका",
    title:"डील जीतें। एग्रीमेंट साइन करें। काम शुरू करें।",subtitle:"प्रोफेशनल प्रपोज़ल बनाएं, उपयुक्त इलेक्ट्रॉनिक सिग्नेचर लें और क्लाइंट के दस्तावेज़ एक सुरक्षित जगह पर जमा करें। एक आसान लिंक से पूरी प्रक्रिया सरल बनाएं।",
    primary:"पहली डील बनाएं",secondary:"कैसे काम करता है देखें",trust:"क्रेडिट कार्ड की ज़रूरत नहीं · कुछ मिनटों में सेटअप · हर आकार की टीम के लिए",preview:"आपका क्लाइंट डील रूम",previewTitle:"ब्रांड पहचान और वेबसाइट प्रोजेक्ट",prepared:"Acme Studio के लिए",investment:"प्रोजेक्ट की कुल कीमत",review:"रिव्यू",sign:"साइन",upload:"फाइल शेयर करें",
    sectionLabel:"पहले ड्राफ्ट से साइन किए गए एग्रीमेंट तक",sectionTitle:"काम आगे बढ़ाने के लिए सभी ज़रूरी टूल।",feature1:"AI की मदद से प्रपोज़ल",feature1d:"क्लाइंट की ज़रूरत को स्पष्ट प्रपोज़ल और काम के दायरे में बदलें। अंतिम नियंत्रण आपका रहेगा।",feature2:"आसान साइनिंग अनुभव",feature2d:"क्लाइंट एक ही जगह एग्रीमेंट देख और साइन कर सकता है।",feature3:"क्लाइंट दस्तावेज़ इकट्ठा करें",feature3d:"ज़रूरी फाइलें मांगें और हर डील के दस्तावेज़ व्यवस्थित रखें।",
    howTitle:"बिज़नेस करने का आसान तरीका।",how1:"बनाएं",how1d:"क्लाइंट, काम, कीमत और ज़रूरी दस्तावेज़ जोड़ें।",how2:"शेयर करें",how2d:"एक निजी लिंक भेजें। क्लाइंट सभी जानकारी एक जगह देखेगा।",how3:"आगे बढ़ें",how3d:"सहमति और फाइलें लें, फिर काम शुरू करें।",
    pricingEyebrow:"सरल और पारदर्शी कीमतें",pricingTitle:"मुफ़्त शुरू करें। बढ़ने पर भी खर्च कम रखें।",pricingCopy:"पहले ज़रूरी फीचर्स इस्तेमाल करें। ज़रूरत होने पर ही अपग्रेड करें।",free:"मुफ़्त",freePrice:"₹0",freeDesc:"पूरे वर्कफ़्लो को आज़माने के लिए।",freeCta:"मुफ़्त शुरू करें",fair:"किफ़ायती प्लान",fairPrice:"जल्द आ रहे हैं",fairDesc:"फ्रीलांसर और बढ़ती टीमों के लिए सरल कीमतें।",fairCta:"कोई बाध्यता नहीं",pricingNote:"पेड सब्सक्रिप्शन शुरू होने से पहले प्लान की सीमाएं और क्षेत्रीय कीमतें घोषित की जाएंगी।",
    globalTitle:"अपनी भाषा में, दुनिया भर में काम करें।",globalCopy:"अपनी भाषा चुनें। तारीख, नंबर और करेंसी आपके क्षेत्र के अनुसार दिखेंगे। और भाषाएं व स्थानीय पेमेंट विकल्प धीरे-धीरे जोड़े जाएंगे।",
    footerLine:"AI प्रपोज़ल · क्लाइंट एग्रीमेंट · दस्तावेज़ संग्रह",copyright:"© {year} SignDealDocs. सर्वाधिकार सुरक्षित।",privacy:"गोपनीयता",terms:"नियम",contact:"संपर्क"
  },
} as const;

export type MessageKey = keyof typeof messages["en-US"];
