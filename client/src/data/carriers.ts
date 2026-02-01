export interface CarrierProduct {
  name: string;
  description: string;
  icon: string;
}

export interface CarrierTestimonial {
  quote: string;
  name: string;
  location: string;
}

export interface CarrierPhoto {
  url: string;
  alt: string;
  caption?: string;
  placement: 'hero' | 'about' | 'history' | 'products' | 'testimonials' | 'gallery';
}

export interface CarrierVideo {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  placement: 'hero' | 'about' | 'history' | 'products' | 'testimonials';
  type: 'youtube' | 'vimeo' | 'hosted';
}

export interface CarrierData {
  slug: string;
  name: string;
  logo: string;
  logoSize?: 'large' | 'normal';
  tagline: string;
  founded: string;
  headquarters: string;
  rating: string;
  ratingAgency: string;
  overview: string;
  history: string;
  whyChoose: string[];
  products: CarrierProduct[];
  keyStats: { label: string; value: string }[];
  testimonials: CarrierTestimonial[];
  photos: CarrierPhoto[];
  videos: CarrierVideo[];
  website: string;
  heroImage: string;
}

export const carriers: CarrierData[] = [
  {
    slug: "americo",
    name: "Americo Financial Life and Annuity Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba",
    tagline: "Protecting American Families Since 1946",
    founded: "1946",
    headquarters: "Kansas City, Missouri",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Americo Financial Life and Annuity Insurance Company is a leading provider of life insurance and annuity products, dedicated to helping American families achieve financial security. With over seven decades of experience, Americo has built a reputation for reliability, competitive products, and exceptional customer service. The company is one of the largest privately held insurance companies in the United States.",
    history: "Founded in 1946 as The College Life Insurance Company of America, Americo has grown from a regional insurer to a national leader in the life insurance industry. The company's commitment to innovation and customer-first approach has enabled it to adapt to changing market conditions while maintaining its core mission of protecting families. Today, Americo serves millions of policyholders across the United States through a network of dedicated independent agents, with over $7 billion in total assets.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best demonstrates strong financial stability",
      "Over 75 years of experience protecting American families",
      "Wide range of term, whole life, and final expense products",
      "Competitive premiums with flexible payment options",
      "Simplified issue policies available with no medical exam",
      "Fast and efficient claims processing",
      "Dedicated support team for agents and policyholders"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage for 10, 20, or 30 years with level premiums and guaranteed death benefits.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent protection with cash value accumulation and guaranteed premiums that never increase.", icon: "Lock" },
      { name: "Final Expense Insurance", description: "Simplified issue coverage designed to cover end-of-life expenses without burdening loved ones.", icon: "Heart" },
      { name: "Fixed Annuities", description: "Tax-deferred growth with guaranteed interest rates for retirement planning.", icon: "TrendingUp" }
    ],
    keyStats: [
      { label: "Years in Business", value: "78+" },
      { label: "Total Assets", value: "$7B+" },
      { label: "States Licensed", value: "49" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Americo was very helpful with setting me up with an affordable policy I can leave for my sons. The process was straightforward and the agent was patient.", name: "Verified Customer", location: "Trustpilot" },
      { quote: "I want to commend the agents for their patience and competence. They answered all of my questions and made my experience with purchasing insurance a great experience.", name: "Verified Customer", location: "Trustpilot" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", alt: "Kansas City skyline - Americo headquarters city", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", alt: "Multi-generational family enjoying time together", placement: "about" },
      { url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", alt: "Senior couple reviewing insurance documents with advisor", placement: "products" },
      { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", alt: "Family financial planning session", placement: "testimonials" }
    ],
    videos: [
      { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "About Americo Financial", description: "Learn about Americo's 78-year history of protecting American families", placement: "about", type: "youtube" }
    ],
    website: "https://www.americo.com",
    heroImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80"
  },
  {
    slug: "athene",
    name: "Athene Annuity and Life Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643",
    tagline: "Retirement Savings Redefined",
    founded: "2009",
    headquarters: "West Des Moines, Iowa",
    rating: "A+",
    ratingAgency: "A.M. Best",
    overview: "Athene is one of the largest providers of retirement savings products in the United States, specializing in fixed annuities and life insurance solutions. As part of Apollo Global Management, Athene combines innovative product design with strong financial backing to deliver exceptional value to policyholders. Athene was the #2 provider of Indexed Annuities in 2024.",
    history: "Founded in 2009, Athene has rapidly grown to become a leader in the retirement savings industry. The company's focus on operational excellence and customer-centric product development has driven its success. In 2021, Apollo Global Management acquired Athene for $11 billion, creating one of the largest financial services firms in the world with over $500 billion in assets under management.",
    whyChoose: [
      "A+ (Superior) rating from A.M. Best reflects exceptional financial strength",
      "Industry-leading fixed and fixed indexed annuity products",
      "Backed by Apollo Global Management's financial expertise",
      "Competitive crediting rates and flexible accumulation options",
      "Strong track record of meeting policyholder obligations",
      "Innovative product features designed for today's retirees",
      "Nationwide network of experienced financial professionals"
    ],
    products: [
      { name: "Fixed Indexed Annuities", description: "Growth potential linked to market indexes with principal protection and guaranteed minimum returns.", icon: "TrendingUp" },
      { name: "Multi-Year Guaranteed Annuities", description: "Predictable growth with guaranteed interest rates for terms of 3 to 10 years.", icon: "Lock" },
      { name: "Income Annuities", description: "Guaranteed lifetime income solutions for a secure retirement.", icon: "DollarSign" },
      { name: "Life Insurance", description: "Permanent life insurance solutions with living benefits and cash value accumulation.", icon: "Shield" }
    ],
    keyStats: [
      { label: "Assets Under Management", value: "$250B+" },
      { label: "Policies in Force", value: "3M+" },
      { label: "Years of Growth", value: "15+" },
      { label: "Financial Strength", value: "A+ Rated" }
    ],
    testimonials: [
      { quote: "Building his best life took a solid financial plan early on. Now I have the freedom to pursue what I love knowing my retirement is secure.", name: "Tal A.", location: "Athene Customer Story" },
      { quote: "Dedication to a financial strategy gives me the means to live my dream. Athene helped me build that foundation.", name: "Graham G.", location: "Athene Customer Story" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=800&q=80", alt: "Retired couple enjoying active lifestyle outdoors", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", alt: "West Des Moines Iowa - Athene headquarters", placement: "about" },
      { url: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80", alt: "Financial advisor consulting with retirement client", placement: "products" },
      { url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80", alt: "Couple celebrating retirement milestone", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.athene.com",
    heroImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80"
  },
  {
    slug: "baltimore-life",
    name: "Baltimore Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c",
    tagline: "A Tradition of Trust Since 1882",
    founded: "1882",
    headquarters: "Owings Mills, Maryland",
    rating: "B++",
    ratingAgency: "A.M. Best",
    overview: "Baltimore Life Insurance Company is one of America's oldest life insurance providers, with over 140 years of experience protecting families. As a mutual company owned by its policyholders, Baltimore Life combines traditional values with a focus on final expense and simplified issue products. The company manages over $1.28 billion in assets.",
    history: "Founded in Baltimore, Maryland in 1882 as 'The Baltimore Mutual Aid Society of Baltimore City' with just $260.93 in starting assets, Baltimore Life has weathered economic storms, world wars, and market changes while consistently fulfilling its promises to policyholders. By 1900, the company changed its name to The Baltimore Life Insurance Company. Today, Baltimore Life continues to serve over 300,000 policyholders across 49 states.",
    whyChoose: [
      "Over 140 years of continuous operation and financial stability",
      "B++ (Good) rating from A.M. Best",
      "Mutual company structure - owned by policyholders, not shareholders",
      "No medical exam required for many policies",
      "Quick underwriting decisions, often within 24-48 hours",
      "Competitive premiums for seniors and those with health conditions",
      "Dedicated home service agent network"
    ],
    products: [
      { name: "Final Expense Insurance", description: "Whole life coverage specifically designed to cover funeral costs and end-of-life expenses.", icon: "Heart" },
      { name: "Simplified Issue Whole Life", description: "Permanent coverage with no medical exam, just answer a few health questions.", icon: "CheckCircle" },
      { name: "Guaranteed Issue Life", description: "Coverage available regardless of health conditions with a graded benefit structure.", icon: "Shield" },
      { name: "Term Life Insurance", description: "Affordable temporary coverage for specific financial obligations.", icon: "Clock" }
    ],
    keyStats: [
      { label: "Years in Business", value: "142+" },
      { label: "States Licensed", value: "49" },
      { label: "Policyholders", value: "300K+" },
      { label: "Total Assets", value: "$1.28B+" }
    ],
    testimonials: [
      { quote: "I can say this company is a great company. It cares about its employees and policyholders and goes the extra mile with customer service and employee needs.", name: "Insurance Professional", location: "Yelp Review (15 years in industry)" },
      { quote: "I've worked with Baltimore Life for 13 years and it's a very family oriented company. I've learned much about marketing, branding and helping families build strong insurance programs.", name: "Long-term Employee", location: "Company Review" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&q=80", alt: "Historic Baltimore Maryland cityscape", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "Owings Mills Maryland - Baltimore Life headquarters area", placement: "about" },
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", alt: "Senior couple in comfortable home setting", placement: "products" },
      { url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80", alt: "Multi-generational family gathering", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.baltimorelife.com",
    heroImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80"
  },
  {
    slug: "corebridge",
    name: "Corebridge Financial",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    tagline: "Building Stronger Financial Futures",
    founded: "1926",
    headquarters: "Houston, Texas",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Corebridge Financial (formerly AIG Life & Retirement) is a leading provider of retirement solutions and life insurance products. With nearly a century of experience through its American General heritage and $350+ billion in assets under management, Corebridge helps millions of Americans plan for and live in retirement with confidence.",
    history: "Corebridge Financial traces its roots to 1926 when Gus Sessions Wortham founded the American General Insurance Company in Houston, Texas. The company became part of AIG and on September 15, 2022, was spun off as an independent publicly traded company in the largest IPO of that year, raising $1.68 billion. This new chapter allows Corebridge to focus exclusively on retirement and life insurance solutions.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best demonstrates exceptional financial strength",
      "Nearly 100 years of experience in financial services",
      "$350+ billion in assets under management",
      "Comprehensive suite of retirement and life insurance products",
      "Industry-leading fixed and variable annuity options",
      "Strong distribution network of financial professionals",
      "Excellent choice for affordable term life insurance rates"
    ],
    products: [
      { name: "Fixed Indexed Annuities", description: "Tax-deferred growth with downside protection and upside potential linked to market indexes.", icon: "TrendingUp" },
      { name: "Variable Annuities", description: "Investment flexibility with a range of professionally managed portfolios.", icon: "BarChart" },
      { name: "Term Life Insurance", description: "Affordable protection for 10, 15, 20, or 30 years.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with cash value accumulation.", icon: "Lock" }
    ],
    keyStats: [
      { label: "Assets Under Management", value: "$350B+" },
      { label: "Years of Heritage", value: "98+" },
      { label: "Customers Served", value: "16M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Great customer service experience and knowledge of insurance. Very simple and easy to complete. Will recommend to others.", name: "Verified Customer", location: "Corebridge Direct Reviews" },
      { quote: "Great coverage and pros all the way! Great rates and quick service, no hassle for me whatsoever. The agent took time to explain everything and aided my decision.", name: "Verified Customer", location: "Customer Survey" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1548519853-bed01c36a709?w=800&q=80", alt: "Houston Texas skyline - Corebridge headquarters city", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80", alt: "American General Center building in Houston", placement: "about" },
      { url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", alt: "Professional business meeting about retirement planning", placement: "products" },
      { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80", alt: "Couple reviewing retirement portfolio together", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.corebridgefinancial.com",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
  },
  {
    slug: "mutual-of-omaha",
    name: "Mutual of Omaha",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173",
    logoSize: "large",
    tagline: "We're Here for Your Tomorrow",
    founded: "1909",
    headquarters: "Omaha, Nebraska",
    rating: "A+",
    ratingAgency: "A.M. Best",
    overview: "Mutual of Omaha is a Fortune 500 mutual insurance and financial services company with over 115 years of experience. As a mutual company, Mutual of Omaha is owned by its policyholders, which means decisions are made with their best interests in mind. The company offers a full range of life, health, and financial products.",
    history: "Founded in 1909, Mutual of Omaha has grown from a small health insurance company to a diversified financial services leader. The company became a household name through its sponsorship of 'Mutual of Omaha's Wild Kingdom,' one of the longest-running shows in television history. Today, Mutual of Omaha continues its tradition of innovation and customer service, serving millions of customers nationwide.",
    whyChoose: [
      "A+ (Superior) rating from A.M. Best - one of the highest possible",
      "Mutual company structure puts policyholders first",
      "Over 115 years of financial strength and stability",
      "Fortune 500 company with $10+ billion in assets",
      "Wide range of life, health, and Medicare products",
      "Exceptional customer service and claims handling",
      "Strong community presence and charitable giving"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage with terms from 10 to 30 years and competitive rates.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Lifetime protection with guaranteed cash value growth and dividends.", icon: "Lock" },
      { name: "Final Expense Insurance", description: "Simplified issue whole life designed to cover funeral and burial costs.", icon: "Heart" },
      { name: "Medicare Supplement Insurance", description: "Fill the gaps in Medicare coverage with comprehensive Medigap plans.", icon: "Plus" }
    ],
    keyStats: [
      { label: "Years in Business", value: "115+" },
      { label: "Total Assets", value: "$10B+" },
      { label: "Customers Served", value: "4M+" },
      { label: "Financial Strength", value: "A+ Rated" }
    ],
    testimonials: [
      { quote: "Having the funds to take care of the services is the biggest blessing! We are so grateful to this company, and their business model that shows more humanity than most.", name: "Verified Customer", location: "ConsumerAffairs" },
      { quote: "My representative has been nothing but helpful, patient, and understanding. The application process was a breeze, and I am now at peace knowing my kids will be provided for.", name: "Verified Customer", location: "ConsumerAffairs" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", alt: "Mutual of Omaha headquarters building in Omaha Nebraska", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&q=80", alt: "Wildlife scene representing Wild Kingdom heritage", placement: "history" },
      { url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", alt: "Three generations of family together", placement: "about" },
      { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", alt: "Senior reviewing Medicare supplement options", placement: "products" }
    ],
    videos: [],
    website: "https://www.mutualofomaha.com",
    heroImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200&q=80"
  },
  {
    slug: "ethos",
    name: "Ethos Life Insurance",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52",
    tagline: "Life Insurance Made Simple",
    founded: "2016",
    headquarters: "San Francisco, California",
    rating: "A to A+",
    ratingAgency: "A.M. Best (Partner Carriers)",
    overview: "Ethos is a technology-driven life insurance platform that makes getting coverage fast, easy, and affordable. By eliminating medical exams for most applicants and streamlining the application process, Ethos has made life insurance accessible to millions of families. Ethos partners with top-rated carriers including Legal & General America (A+) and Ameritas (A) to issue policies.",
    history: "Founded in 2016 by classmates Peter Colis and Lingke Wang, Ethos set out to reinvent the insurance industry. The company reached unicorn status in 2021, raising $408M in funding from investors like Accel, Sequoia Capital, and General Catalyst, with a valuation of $2.7 billion. Ethos uses advanced data analytics to remove traditional barriers to coverage.",
    whyChoose: [
      "10-minute online application with instant decisions",
      "No medical exam required for most applicants",
      "Policies issued by A to A+ rated insurance carriers",
      "Coverage amounts from $20,000 to $8 million",
      "4.8/5 star rating on Trustpilot",
      "A+ rating from Better Business Bureau",
      "Backed by leading Silicon Valley investors"
    ],
    products: [
      { name: "Term Life Insurance", description: "Coverage from 10 to 30 years with no medical exam required for most.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent coverage that builds cash value over time.", icon: "Lock" },
      { name: "No-Exam Life Insurance", description: "Get covered in minutes using health data instead of medical exams.", icon: "CheckCircle" },
      { name: "Instant Term Life", description: "Same-day coverage decisions for eligible applicants.", icon: "Zap" }
    ],
    keyStats: [
      { label: "Average Approval Time", value: "10 min" },
      { label: "Trustpilot Rating", value: "4.8/5" },
      { label: "Company Valuation", value: "$2.7B" },
      { label: "Carrier Ratings", value: "A to A+" }
    ],
    testimonials: [
      { quote: "Great experience, very communicative customer service. My experience with Ethos folks so far has been outstanding. Everyone I have spoken over the phone were knowledgeable and helpful.", name: "Saravanan R.", location: "California" },
      { quote: "It was the easiest transaction ever! I loved getting this insurance policy! I still work full time and I saved a lot of time!", name: "Wendell M.", location: "South Carolina" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1596568005218-e6ce0db16942?w=800&q=80", alt: "Young family using smartphone for insurance application", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "San Francisco tech startup office environment", placement: "about" },
      { url: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80", alt: "Parent with young children at home", placement: "products" },
      { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", alt: "Diverse group of happy customers", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.ethoslife.com",
    heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
  },
  {
    slug: "royal-neighbors",
    name: "Royal Neighbors of America",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56",
    tagline: "Neighbor Helping Neighbor Since 1895",
    founded: "1895",
    headquarters: "Rock Island, Illinois",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Royal Neighbors of America is a unique fraternal benefit society that combines life insurance protection with a mission of community service. Founded by nine visionary women over 130 years ago, Royal Neighbors continues to empower members and communities through financial security and philanthropic programs. The organization now serves nearly 300,000 members nationwide.",
    history: "Founded in 1895 by nine pioneering women in Rock Island, Illinois, Royal Neighbors of America was one of the first organizations to offer life insurance to women on the same terms as men. In 2020, Royal Neighbors was upgraded to 'A Excellent' by A.M. Best, a rating affirmed in December 2024. In 2025, it was named a Forbes America's Best Insurance Company. The organization is now the second-fastest growing fraternal life insurance organization in the United States.",
    whyChoose: [
      "130 years of experience protecting families",
      "A (Excellent) rating from A.M. Best (affirmed 2024)",
      "Fraternal benefit society focused on member welfare",
      "Forbes America's Best Insurance Company 2025",
      "Simplified issue products with competitive rates",
      "Strong focus on serving women and families",
      "Community-based approach with local chapters"
    ],
    products: [
      { name: "Simplified Issue Whole Life", description: "Permanent coverage with no medical exam required.", icon: "Shield" },
      { name: "Final Expense Insurance", description: "Affordable coverage to protect loved ones from end-of-life costs.", icon: "Heart" },
      { name: "Juvenile Life Insurance", description: "Build a financial foundation for children while providing protection.", icon: "Users" },
      { name: "Term Life Insurance", description: "Affordable temporary coverage for specific needs.", icon: "Clock" }
    ],
    keyStats: [
      { label: "Years in Business", value: "130+" },
      { label: "Members Served", value: "300K" },
      { label: "Scholarships Awarded", value: "$2M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Royal Neighbors has been a great company and I love the products they offer! I have had great customer service with them any time I have a question. The website is easy to navigate and I am very satisfied with their services.", name: "Verified Member", location: "BBB Review" },
      { quote: "Best company I've ever seen when it comes to approving day one coverage. Royal Neighbors of America has kept my family out of debt for a long time.", name: "Verified Member", location: "Customer Review" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80", alt: "Group of women in community gathering", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", alt: "Community members together", placement: "history" },
      { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80", alt: "Rock Island Illinois - Royal Neighbors headquarters", placement: "about" },
      { url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80", alt: "Community volunteer service event", placement: "products" }
    ],
    videos: [],
    website: "https://www.royalneighbors.org",
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
  },
  {
    slug: "transamerica",
    name: "Transamerica",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d",
    logoSize: "large",
    tagline: "Building a Stronger Tomorrow",
    founded: "1904",
    headquarters: "Cedar Rapids, Iowa",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Transamerica is one of the largest and most recognized life insurance companies in America, serving millions of customers with life insurance, retirement, and investment solutions. As part of Aegon N.V., a Dutch global financial services leader, Transamerica brings 120 years of experience and over $75 billion in total assets.",
    history: "Founded in San Francisco in 1904, Transamerica has a storied history intertwined with American progress. The company's iconic pyramid headquarters became a symbol of strength and stability. In 1999, Aegon N.V. purchased Transamerica. Today, Transamerica Life Insurance Company is based in Cedar Rapids, Iowa, and serves approximately 13 million customers across the United States.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best",
      "120 years of industry experience",
      "Over $75 billion in total assets",
      "Part of Aegon, a global financial services leader",
      "Comprehensive suite of life and retirement products",
      "Competitive term life insurance rates",
      "Solid indexed universal life (IUL) options with living benefits"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage for 10, 15, 20, or 30 years with level premiums.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with adjustable premiums and death benefits.", icon: "Lock" },
      { name: "Indexed Universal Life", description: "Cash value growth potential linked to market indexes with downside protection.", icon: "TrendingUp" },
      { name: "Fixed Annuities", description: "Guaranteed interest rates for secure retirement income.", icon: "DollarSign" }
    ],
    keyStats: [
      { label: "Years in Business", value: "120+" },
      { label: "Total Assets", value: "$75B+" },
      { label: "Customers Served", value: "13M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "My mom passed and I submitted a death claim. Both customer service and claims were very helpful and my experience was amazing.", name: "Verified Customer", location: "ConsumerAffairs" },
      { quote: "Easy and straight forward process. There is always a live person to speak to if questions arise and the online communication is easy too.", name: "Verified Customer", location: "Trustpilot" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800&q=80", alt: "Transamerica Pyramid building in San Francisco - iconic landmark", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", alt: "Cedar Rapids Iowa - Transamerica headquarters", placement: "about" },
      { url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", alt: "Family financial planning session with advisor", placement: "products" },
      { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80", alt: "Couple reviewing retirement strategy", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.transamerica.com",
    heroImage: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=1200&q=80"
  },
  {
    slug: "american-home-life",
    name: "American Home Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
    logoSize: "large",
    tagline: "Protecting Families with Care Since 1909",
    founded: "1909",
    headquarters: "Topeka, Kansas",
    rating: "Stable Outlook",
    ratingAgency: "A.M. Best",
    overview: "American Home Life Insurance Company specializes in final expense and simplified issue life insurance products, making coverage accessible to seniors and those who may have been declined elsewhere. With over 115 years of experience, the company has built a reputation for compassionate service and reliable protection.",
    history: "Founded in 1909 in Topeka, Kansas as Kansas Home Mutual Life Insurance Company, the company merged with American Mutual Life Insurance Company of McPherson, Kansas in 1912 and adopted its current name. American Home Life has been BBB Accredited since 1987 and holds an A+ BBB rating. The company continues its mission of making life insurance accessible to all Americans.",
    whyChoose: [
      "Stable Outlook rating from A.M. Best",
      "Over 115 years specializing in simplified issue products",
      "A+ rating from Better Business Bureau since 1987",
      "No medical exam required",
      "Immediate coverage available on most policies",
      "Competitive rates for final expense coverage",
      "Values of honesty, integrity, and courtesy"
    ],
    products: [
      { name: "Final Expense Insurance", description: "Whole life coverage specifically designed to cover funeral and burial costs.", icon: "Heart" },
      { name: "Simplified Issue Whole Life", description: "Permanent coverage with just a few health questions and no medical exam.", icon: "CheckCircle" },
      { name: "Guaranteed Issue Life", description: "Coverage available regardless of health with a modified benefit period.", icon: "Shield" },
      { name: "Preneed Insurance", description: "Coverage designed to pre-fund funeral arrangements.", icon: "Users" }
    ],
    keyStats: [
      { label: "Years in Business", value: "116+" },
      { label: "BBB Rating", value: "A+" },
      { label: "BBB Accredited Since", value: "1987" },
      { label: "A.M. Best Outlook", value: "Stable" }
    ],
    testimonials: [
      { quote: "American Home Life Insurance Company is a great choice for final expense life insurance if you're a senior with a serious health issue. They will probably approve you with an immediate death benefit when most companies would deny you.", name: "Industry Expert", location: "Final Expense Direct" },
      { quote: "We rank American Home Life in our top ten carriers with a top review rating. Their commitment to policyholders is one of trust and delivering at the time of need.", name: "Medicare Review", location: "Insurance Rating Site" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", alt: "Kansas prairie landscape - heartland of America", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", alt: "Topeka Kansas - American Home Life headquarters city", placement: "about" },
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", alt: "Senior couple relaxing at home", placement: "products" },
      { url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80", alt: "Caring family moment with elderly parent", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.amhomelife.com",
    heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
  },
  {
    slug: "polish-falcons",
    name: "Polish Falcons of America",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
    tagline: "A Polish-American Tradition Since 1928",
    founded: "1928",
    headquarters: "Pittsburgh, Pennsylvania",
    rating: "A+",
    ratingAgency: "BBB",
    overview: "Polish Falcons of America is a not-for-profit, member-driven fraternal benefit society that combines life insurance with a rich tradition of Polish-American culture and community service. As a fraternal organization, Polish Falcons provides more than insurance—members enjoy scholarships, community service grants, and access to social events.",
    history: "The Polish Falcons movement began in 1887 as a youth-focused gymnastic society in Chicago. On March 30, 1928, Polish Falcons of America was established as a fraternal benefit society, with Pittsburgh serving as headquarters since 1912. Today, the organization serves over 23,000 members nationwide through a network of local nests (chapters), offering insurance services, physical education programs, and cultural activities.",
    whyChoose: [
      "96+ years of serving Polish-American communities as a fraternal benefit society",
      "A+ rating from Better Business Bureau (Accredited since 2024)",
      "Not-for-profit, member-driven organization",
      "Scholarships and cultural programs for members",
      "Disaster Relief Fund and Member Assistance Fund",
      "Strong community ties with local nests (chapters)",
      "Newborn benefit and bereaved child benefit for families"
    ],
    products: [
      { name: "Whole Life Insurance", description: "Permanent protection with cash value and fraternal benefits.", icon: "Shield" },
      { name: "Term Life Insurance", description: "Affordable temporary coverage for specific needs.", icon: "Clock" },
      { name: "Juvenile Life Insurance", description: "Start building protection and savings for children early.", icon: "Users" },
      { name: "Medicare Supplement", description: "Coverage to help with Medicare gaps.", icon: "Heart" }
    ],
    keyStats: [
      { label: "Years as Fraternal Society", value: "96+" },
      { label: "Members Nationwide", value: "23K+" },
      { label: "BBB Rating", value: "A+" },
      { label: "Local Nests", value: "100+" }
    ],
    testimonials: [
      { quote: "My family has a nearly century long lineage with the Falcons. PFA is a fantastic organization - very organized and friendly. It's more than insurance, it's community.", name: "Multi-Generation Member", location: "Member Review" },
      { quote: "As a member, I enjoy the social events, scholarships, and community service grants. The Disaster Relief Fund and Member Assistance Fund have helped so many families in need.", name: "Active Member", location: "Member Testimonial" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", alt: "Polish cultural celebration with traditional elements", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80", alt: "Pittsburgh Pennsylvania skyline - Polish Falcons headquarters city", placement: "about" },
      { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", alt: "Youth gymnastics and sports activities", placement: "history" },
      { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", alt: "Community gathering at local Polish Falcons nest", placement: "products" }
    ],
    videos: [],
    website: "https://www.polishfalcons.org",
    heroImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80"
  },
  {
    slug: "ladder",
    name: "Ladder Life Insurance",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733",
    tagline: "Smart Life Insurance",
    founded: "2015",
    headquarters: "Palo Alto, California",
    rating: "A- to A+",
    ratingAgency: "A.M. Best (Partner Carriers)",
    overview: "Ladder is a technology-driven life insurance platform that has reimagined how families get coverage. With instant online applications, flexible coverage that can be adjusted as life changes, and policies backed by top-rated insurers, Ladder makes life insurance smarter and more accessible. Ladder holds a 4.8/5 star rating on Trustpilot from nearly 3,000 reviews.",
    history: "Founded in 2015 by former insurance executives and tech entrepreneurs, Ladder launched in 2017 and was built to solve the problem of flexibility in life insurance. The company introduced 'laddering'—the ability to instantly adjust coverage up or down as needs change. Ladder partners with four established carriers: Fidelity Security Life (A), Allianz Life (A+), Amica Life (A+), and S.USA Life (A-). By 2020, Ladder offered life insurance in all 50 states.",
    whyChoose: [
      "Instant coverage decisions in as little as 5 minutes",
      "Flexible coverage that adjusts as your life changes",
      "No medical exam required for coverage up to $3 million",
      "Policies backed by A- to A+ rated insurance carriers",
      "4.8/5 star rating on Trustpilot (nearly 3,000 reviews)",
      "A+ rating from Better Business Bureau",
      "Transparent pricing with no hidden fees"
    ],
    products: [
      { name: "Term Life Insurance", description: "Coverage from 10 to 30 years with instant approval for most applicants.", icon: "Shield" },
      { name: "Flexible Term", description: "Unique laddering feature lets you adjust coverage without reapplying.", icon: "Sliders" },
      { name: "No-Exam Term", description: "Up to $3 million in coverage with no medical exam required.", icon: "CheckCircle" },
      { name: "Instant Issue", description: "Get covered today with same-day decisions.", icon: "Zap" }
    ],
    keyStats: [
      { label: "Average Approval Time", value: "5 min" },
      { label: "Trustpilot Rating", value: "4.8/5" },
      { label: "Max No-Exam Coverage", value: "$3M" },
      { label: "Carrier Ratings", value: "A- to A+" }
    ],
    testimonials: [
      { quote: "Ladder made getting life insurance incredibly fast, easy, and affordable. The entire process was seamless—from the application to approval.", name: "Verified Customer", location: "Trustpilot" },
      { quote: "Shockingly quick process, start to finish was about 5 minutes. Approved almost instantly after submission. No selling, upselling, or emotional games at all during the application.", name: "Verified Customer", location: "Trustpilot" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", alt: "Young professional using laptop for insurance application", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "Palo Alto Silicon Valley tech environment", placement: "about" },
      { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80", alt: "Young family with new home celebrating", placement: "products" },
      { url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80", alt: "Person adjusting coverage on smartphone app", placement: "gallery" }
    ],
    videos: [],
    website: "https://www.ladderlife.com",
    heroImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&q=80"
  },
  {
    slug: "lincoln-financial",
    name: "Lincoln Financial Group",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b",
    tagline: "What if You Live to 100?",
    founded: "1905",
    headquarters: "Radnor, Pennsylvania",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Lincoln Financial Group is a Fortune 250 company and one of the largest life insurance and retirement services providers in America. With 120 years of experience and over $101 billion in total assets, Lincoln helps over 17 million customers protect their families and prepare for retirement. Named one of Newsweek's America's Most Responsible Companies of 2024.",
    history: "Founded in 1905 in Fort Wayne, Indiana, Lincoln Financial was named in honor of President Abraham Lincoln, representing trust and integrity. The company has grown into a diversified financial services leader while maintaining its founding principles. Today, Lincoln Financial serves over 17 million customers through a comprehensive range of life insurance, annuities, and retirement plan services.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best with stable outlook",
      "Fortune 250 company with 120 years of experience",
      "Over $101 billion in total assets",
      "70% fewer complaints than expected for company size (NAIC)",
      "Industry-leading indexed universal life products",
      "100% of surveyed customers plan to renew",
      "91% of customers rate Lincoln highly for trustworthiness"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage from 10 to 30 years with competitive rates.", icon: "Shield" },
      { name: "Indexed Universal Life", description: "Permanent coverage with cash value growth linked to market indexes.", icon: "TrendingUp" },
      { name: "Variable Universal Life", description: "Flexible coverage with investment options for cash value growth.", icon: "BarChart" },
      { name: "Fixed Annuities", description: "Guaranteed interest rates for stable retirement income.", icon: "DollarSign" }
    ],
    keyStats: [
      { label: "Years in Business", value: "120" },
      { label: "Total Assets", value: "$101B+" },
      { label: "Customers Served", value: "17M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Lincoln Financial processed my claim within five business days after receiving all documentation. They assigned a dedicated claims specialist who guided me through every step of the process.", name: "Beneficiary", location: "Claims Experience" },
      { quote: "I plan to renew with Lincoln Financial. They've earned my trust over the years with their reliability and the peace of mind knowing my family is protected by a company with 120 years of history.", name: "Long-term Policyholder", location: "Customer Survey" }
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&q=80", alt: "Abraham Lincoln memorial imagery", placement: "hero" },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", alt: "Radnor Pennsylvania - Lincoln Financial headquarters", placement: "about" },
      { url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", alt: "Multi-generational family wealth planning session", placement: "products" },
      { url: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=800&q=80", alt: "Senior couple enjoying active retirement", placement: "testimonials" }
    ],
    videos: [],
    website: "https://www.lfg.com",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
  }
];

// Helper function to get carrier by slug
export function getCarrierBySlug(slug: string): CarrierData | undefined {
  return carriers.find(c => c.slug === slug);
}

// Export carrier list for carousel with links
export const carrierLinks = carriers.map(c => ({
  name: c.name,
  logo: c.logo,
  size: c.logoSize,
  href: `/carriers/${c.slug}`
}));
