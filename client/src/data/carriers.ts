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
  logoSize?: 'large' | 'normal' | 'xl';
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
    slug: "american-amicable",
    name: "American-Amicable Life Insurance Company of Texas",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477431400-0609c28bdd65d75b-1779477431400-4eda86bc-american-amicable_logo_1.png?alt=media&token=89fe44f6-3263-4aac-812b-bb9114570b15",
    tagline: "Texas Heritage Since 1910",
    founded: "1910",
    headquarters: "Waco, Texas",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "American-Amicable Life Insurance Company of Texas is a Waco-based life insurer offering whole life, term, and final expense coverage through independent agents. With more than a century of operating history, the company serves the special markets segment with simplified-issue products designed for everyday families. Since 2010, American-Amicable has operated as a wholly owned subsidiary of iA Financial Group, one of the largest insurance and wealth management groups in North America.",
    history: "The company traces its roots to 1910, when Amicable Life Insurance Company was founded in Waco, Texas, later evolving into American-Amicable Life Insurance Company of Texas. The historic ALICO Building in downtown Waco remains the home office to this day. In 2010, Industrial Alliance Insurance and Financial Services acquired American-Amicable Holding for approximately $145 million, anchoring iA's growth platform in the U.S. life insurance market.",
    whyChoose: [
      "115+ years of operating history dating to 1910",
      "Wholly owned subsidiary of iA Financial Group (Industrial Alliance)",
      "Specialist in whole life, term, and final expense products",
      "A (Excellent) financial strength rating from A.M. Best",
      "Part of one of North America's largest insurance and wealth management groups",
      "Simplified-issue and no-medical-exam options available"
    ],
    products: [
      { name: "Whole Life Insurance", description: "Permanent coverage with guaranteed level premiums and tax-deferred cash value accumulation for life.", icon: "Lock" },
      { name: "Term Life Insurance", description: "Level-premium term coverage built to protect families during key income-earning years.", icon: "Shield" },
      { name: "Final Expense Insurance", description: "Simplified-issue whole life with no medical exam, designed to cover funeral and end-of-life costs.", icon: "Heart" },
      { name: "Fixed Annuities", description: "Tax-deferred annuity products offering guaranteed growth and predictable retirement income.", icon: "TrendingUp" }
    ],
    keyStats: [
      { label: "Years in Business", value: "115+" },
      { label: "Financial Strength", value: "A Rated" },
      { label: "Parent Company", value: "iA Financial Group" },
      { label: "Headquarters", value: "Waco, TX" }
    ],
    testimonials: [
      { quote: "I've held policies with four different companies. American Amicable was by far the easiest, fastest, and most respectful of them all.", name: "Long-term Agent", location: "Industry Review (2024)" },
      { quote: "Dealing with multiple carriers on a regular basis, American Amicable is one of the easiest and smoothest to work with. The simplified underwriting and mobile application get an almost instantaneous decision.", name: "Insurance Professional", location: "DIG Agency Carrier Review" }
    ],
    photos: [],
    videos: [],
    website: "https://americanamicable.com",
    heroImage: ""
  },
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770075573838-2.jpg?alt=media&token=44e4540d-d7aa-4e44-8106-8738330f83ff", alt: "Americo Financial headquarters", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770075578788-3.jpg?alt=media&token=121e37ef-4811-4232-bb7c-7e86fc93d99e", alt: "Americo Financial office", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770075583450-4.jpg?alt=media&token=94fe9a37-a62b-4baf-b856-684928b0fa78", alt: "Americo Financial building", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770075588067-intern1-2023update.png?alt=media&token=ba44a7c9-6e1b-4726-a23f-2895f6cd48f9", alt: "Americo Financial team", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770221411357-Americo_%20A%20Legacy%20of%20Protection.mp4?alt=media&token=1bd821ed-efd1-41b4-9189-96af48305ee0", title: "Americo: A Legacy of Protection", description: "Learn about Americo's 78-year history of protecting American families", placement: "about", type: "hosted" }
    ],
    website: "https://www.americo.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770074718548-unionstation-7.jpg?alt=media&token=7c275e54-ef65-448a-a983-686826d1cf51"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077158256-modAgents.jpg?alt=media&token=166a09a6-57ad-4837-ab6c-306527ed927a", alt: "Baltimore Life insurance agents", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077161981-headerAboutUs.jpg?alt=media&token=cb0059db-93a7-47cf-bc90-c69ee3b62af8", alt: "Baltimore Life about us", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077166597-headerProductPort.jpg?alt=media&token=207bbdaf-6231-48d4-9fb7-c0b9389d8833", alt: "Baltimore Life products", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077172095-career-employment-Baltimore-Life.png?alt=media&token=81c33d9f-6037-4dd7-8626-f1b4bb636c89", alt: "Baltimore Life careers", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770226116626-Baltimore%20Life_%20Trusted%20for%20Generations.mp4?alt=media&token=0a876e4c-ffe4-4606-845b-2755bc91ceed", title: "Baltimore Life: Trusted for Generations", description: "Over 140 years of protecting American families", placement: "about", type: "hosted" }
    ],
    website: "https://www.baltimorelife.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770076992593-Baltimore-Inner-Harbor.jpg?alt=media&token=d275e2eb-74d9-4737-8cf4-1c585e9d5e6d"
  },
  {
    slug: "corebridge",
    name: "Corebridge Financial",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    tagline: "Building Stronger Financial Futures",
    founded: "1926",
    headquarters: "Houston, Texas",
    rating: "A (Under Review)",
    ratingAgency: "A.M. Best",
    overview: "Corebridge Financial is a leading U.S. provider of retirement solutions and life insurance, serving millions of Americans through its American General heritage. With nearly a century of experience and over $350 billion in assets under management, Corebridge offers a comprehensive suite of annuity and life products through financial professionals. The company was spun out from AIG in 2022 and announced a pending merger with Equitable Holdings in March 2026.",
    history: "Corebridge Financial traces its roots to 1926, when Gus Sessions Wortham founded the American General Insurance Company in Houston, Texas. On September 15, 2022, the company was spun off from AIG as an independent publicly traded company in the largest IPO of that year, raising $1.68 billion. Today Corebridge focuses exclusively on retirement and life insurance solutions, serving 16 million customers nationwide.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best demonstrates exceptional financial strength",
      "Nearly 100 years of experience in financial services",
      "$350+ billion in assets under management",
      "Comprehensive suite of retirement and life insurance products",
      "Industry-leading fixed and variable annuity options",
      "Strong distribution network of financial professionals",
      "Competitive term life coverage with flexible duration options"
    ],
    products: [
      { name: "Fixed Indexed Annuities", description: "Tax-deferred growth with downside protection and upside potential linked to market indexes.", icon: "TrendingUp" },
      { name: "Variable Annuities", description: "Investment flexibility with a range of professionally managed portfolios.", icon: "BarChart" },
      { name: "Term Life Insurance", description: "Affordable protection for 10, 15, 20, or 30 years.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with cash value accumulation.", icon: "Lock" }
    ],
    keyStats: [
      { label: "Years in Business", value: "98+" },
      { label: "Total Assets", value: "$350B+" },
      { label: "Customers Served", value: "16M+" },
      { label: "Financial Strength", value: "A (Under Review)" }
    ],
    testimonials: [
      { quote: "Great customer service experience and knowledge of insurance. Very simple and easy to complete. Will recommend to others.", name: "Verified Customer", location: "Corebridge Direct Reviews" },
      { quote: "Great coverage and pros all the way! Great rates and quick service, no hassle for me whatsoever. The agent took time to explain everything and aided my decision.", name: "Verified Customer", location: "Customer Survey" }
    ],
    photos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077713216-career_banner_with_people.jpg?alt=media&token=03b00fca-d4db-4c9a-b49a-42a7e94df20f", alt: "Corebridge Financial team", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077708790-1705533247362.jpeg?alt=media&token=8460304c-9dc7-4b67-b7da-c6da611e4162", alt: "Corebridge Financial team", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077705205-JA_ERG2.png?alt=media&token=52045b42-1d58-4651-b4ea-43c04c764f33", alt: "Corebridge Financial employee resource group", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077699967-1000s.jpg?alt=media&token=214674d9-4922-42e7-ab01-99b115ed2692", alt: "Corebridge Financial community", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770231434871-Corebridge%20Financial_%20Built%20for%20Confidence.mp4?alt=media&token=1e8b7086-fcb5-4888-81c0-c0eaf8e8eef4", title: "Corebridge Financial: Built for Confidence", description: "Building stronger financial futures for millions of Americans", placement: "about", type: "hosted" }
    ],
    website: "https://www.corebridgefinancial.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077320847-0150681.webp?alt=media&token=876ef634-0d48-4c66-aa86-de2b241fba3f"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078310588-AdobeStock_148871930-1536x766-landscape-1bc06457d4f4eed955eac4f555ac78da-mgaio2kphz8b.jpg?alt=media&token=564f63ae-8f96-4c05-b013-fa0a5bccfc8b", alt: "Mutual of Omaha customer service", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078316944-AdobeStock_241427046-scaled.jpg?alt=media&token=0831e5cf-6a6a-441c-a3b1-45e7d329e7e5", alt: "Mutual of Omaha family protection", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078321349-MutualExchange-scaled.jpeg?alt=media&token=59729eb8-266c-478e-93df-a9baa5c99d60", alt: "Mutual of Omaha Exchange", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078331651-EEMydZwWwAAHjah.jpg?alt=media&token=ba38a3d4-2a6e-4682-8624-c860b522c0ad", alt: "Mutual of Omaha community", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770238562019-Mutual%20of%20Omaha_%20Built%20for%20Life.mp4?alt=media&token=55da419c-230e-43c5-a605-2093ef49773f", title: "Mutual of Omaha: Built for Life", description: "115+ years of protecting families and helping them achieve financial security", placement: "about", type: "hosted" }
    ],
    website: "https://www.mutualofomaha.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770077998953-hero-Mutual-of-Omaha_Hero.jpg?alt=media&token=f99f98dd-2a4b-4a71-8920-ff4a9dbe4c15"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078772377-life-insurance-01-coworkers-having-a-conversation.jpg?alt=media&token=235e1096-abaf-4769-b691-734c2bf3956f", alt: "Ethos coworkers conversation", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078788507-Hero-Image_Mobile_2_mqfp52.webp?alt=media&token=fc3c75cf-504f-49ea-b5c5-b02d5b014ffa", alt: "Ethos mobile app", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078781111-1_oXXWHlTmKp3UPKyx9xD8MQ.jpg?alt=media&token=28928b7f-475c-4bd1-8ff8-596e14879089", alt: "Ethos team", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078777161-agency%401x.jpg?alt=media&token=833597ac-a33b-4a65-a961-9ee7ce315c59", alt: "Ethos agency", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770245419612-Ethos%20-%20Life%20Insurance%20Built%20for%20Today.mp4?alt=media&token=a0190f62-1542-4c1f-ba23-32b7d9c5ccf4", title: "Ethos: Life Insurance Built for Today", description: "Get life insurance in minutes, not weeks", placement: "about", type: "hosted" }
    ],
    website: "https://www.ethoslife.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770078562366-istockphoto-476881195-612x612.jpg?alt=media&token=a0d9dfd1-ab8d-4b16-9a33-946fcffe4a43"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079491195-company_image_2.webp?alt=media&token=63cbc508-1642-4f40-9f0b-c2343cca1b19", alt: "Royal Neighbors community image", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079500173-company_image_1.jpg?alt=media&token=1d6ae0a6-2201-492a-9ec8-1d97db993c9a", alt: "Royal Neighbors team", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079513720-About-Us-How-it-Works.png?alt=media&token=c3eded8c-c97e-4855-90f0-596bdef0ac80", alt: "Royal Neighbors how it works", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079519185-company_image_5.webp?alt=media&token=5730d3dd-a236-4206-8b0d-ef219fe6a809", alt: "Royal Neighbors community service", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770250413822-Royal%20Neighbors_%20A%20Legacy%20of%20Purpose.mp4?alt=media&token=8af58632-dfdb-4fd2-ba75-d8ba8de69d35", title: "Royal Neighbors: A Legacy of Purpose", description: "Neighbor helping neighbor since 1895", placement: "about", type: "hosted" }
    ],
    website: "https://www.royalneighbors.org",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079074172-Hero_Best-Skyline-Views.jpg?alt=media&token=4f85240b-1774-49ba-9964-94494fa1805a"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079958481-adobestock_301163419.jpg?alt=media&token=f4d1d5c8-14c2-49b1-8d08-194b6ec9a004", alt: "Transamerica team collaboration", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079955387-adobestock_304074642-1200x810-21ff5cf.jpg?alt=media&token=b776846b-7212-43b0-893b-e1b71129c965", alt: "Transamerica customer service", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079952405-graduates_smiling_outside_building.jpg?alt=media&token=e07fdae5-1f9c-4558-80cf-b21631d402bd", alt: "Transamerica graduates celebration", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079949060-adobestock_322174411-1200x800-5b2df79.jpg?alt=media&token=8f44aa0b-d4fe-4c51-8e0b-7040718a00cd", alt: "Transamerica community", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770309760428-Transamerica_%20A%20Legacy%20of%20Strength.mp4?alt=media&token=aac0ba6a-b029-4a01-b68c-36bc2cf1ae78", title: "Transamerica: A Legacy of Strength", description: "120 years of helping Americans achieve financial security", placement: "about", type: "hosted" }
    ],
    website: "https://www.transamerica.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770079764587-San-Francisco-California-Transamerica-Pyramid-building.webp?alt=media&token=001783fe-c087-40eb-bd30-ce521f122de9"
  },
  {
    slug: "american-home-life",
    name: "American Home Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
    logoSize: "large",
    tagline: "Protecting Families with Care Since 1909",
    founded: "1909",
    headquarters: "Topeka, Kansas",
    rating: "B++",
    ratingAgency: "A.M. Best",
    overview: "American Home Life Insurance Company is a Topeka, Kansas-based life insurer specializing in final expense and simplified-issue coverage for seniors and underserved applicants. With over 115 years of operating history, the company offers no-medical-exam policies with immediate coverage options for most applicants. American Home Life holds a B++ (Good) financial strength rating from A.M. Best and has been BBB Accredited with an A+ rating since 1987.",
    history: "Founded in 1909 in Topeka, Kansas as Kansas Home Mutual Life Insurance Company, the company merged with American Mutual Life Insurance Company of McPherson, Kansas in 1912 and adopted its current name. Over the decades, American Home Life narrowed its focus to simplified-issue and final expense coverage, distributed primarily through independent agents. The company has remained independently owned and headquartered in Topeka throughout its 115-year history.",
    whyChoose: [
      "115+ years of operating history dating to 1909",
      "B++ (Good) financial strength rating from A.M. Best",
      "A+ Better Business Bureau rating, accredited since 1987",
      "Specialist in simplified-issue and final expense coverage",
      "No medical exam required on most policies",
      "Immediate coverage available for qualifying applicants"
    ],
    products: [
      { name: "Final Expense Insurance", description: "Whole life coverage designed to cover funeral, burial, and end-of-life expenses.", icon: "Heart" },
      { name: "Simplified Issue Whole Life", description: "Permanent coverage with a few health questions and no medical exam required.", icon: "CheckCircle" },
      { name: "Guaranteed Issue Life", description: "Coverage available regardless of health with a graded benefit period.", icon: "Shield" },
      { name: "Preneed Insurance", description: "Whole life coverage designed to pre-fund funeral arrangements with a chosen provider.", icon: "Lock" }
    ],
    keyStats: [
      { label: "Years in Business", value: "116+" },
      { label: "Headquarters", value: "Topeka, KS" },
      { label: "BBB Rating", value: "A+ (since 1987)" },
      { label: "Financial Strength", value: "B++ Rated" }
    ],
    testimonials: [
      { quote: "American Home Life Insurance Company is a great choice for final expense life insurance if you're a senior with a serious health issue. They will probably approve you with an immediate death benefit when most companies would deny you.", name: "Industry Expert", location: "Final Expense Direct" },
      { quote: "We rank American Home Life in our top ten carriers with a top review rating. Their commitment to policyholders is one of trust and delivering at the time of need.", name: "Medicare Review", location: "Insurance Rating Site" }
    ],
    photos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080522553-life-insurance-remote-jobs.webp?alt=media&token=d303571f-4598-4820-96a0-be7086fd759a", alt: "American Home Life remote work", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080525967-0343_638362679349188302.avif?alt=media&token=3cfcc21d-d84f-43ee-8620-e8c127725be3", alt: "American Home Life team", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080529100-Friendly-insurance-agent-meets-client-at-home.webp?alt=media&token=c612feec-5d34-4753-9552-2db60a6c6027", alt: "American Home Life agent meeting client", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080532693-99dd65_19a6ad5314424143a0155473a9f7adda~mv2.avif?alt=media&token=c579a6a6-3a40-44c6-a4a7-f269648c2763", alt: "American Home Life customer service", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770311112909-American%20Home%20Life_%20A%20Promise%20Kept.mp4?alt=media&token=d3d2daa4-798e-4a8a-a4d6-ba75a173c1ed", title: "American Home Life: A Promise Kept", description: "Protecting families with care since 1909", placement: "about", type: "hosted" }
    ],
    website: "https://www.amhomelife.com",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080221375-kansas-1-1024x615.jpg?alt=media&token=4920cc24-8b1f-481a-8594-285540f47264"
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
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770081158263-comm-old-club_orig.jpg?alt=media&token=46bd9f4c-e7b5-4afd-b042-db6bad3dc231", alt: "Polish Falcons historic club", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770081162236-Community-Service-banner.jpg?alt=media&token=35c8890a-f84f-49e7-a5e8-ce6c974d0ca9", alt: "Polish Falcons community service", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770081166036-1939-unidenified-club-picture_orig.jpg?alt=media&token=186df889-b859-4a3e-8392-7dd49c2d3e33", alt: "Polish Falcons 1939 club photo", placement: "gallery" },
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770081170337-Nests-top.png?alt=media&token=06af22b7-e387-4537-a01b-3b1f586e43da", alt: "Polish Falcons nests", placement: "gallery" }
    ],
    videos: [
      { url: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fexplainers%2F1770401525751-Polish%20Falcons_%20A%20Century%20of%20Heritage.mp4?alt=media&token=483728d8-de7a-4138-a26c-d3fd4a33a03a", title: "Polish Falcons: A Century of Heritage", description: "A Polish-American tradition of community and protection since 1928", placement: "about", type: "hosted" }
    ],
    website: "https://www.polishfalcons.org",
    heroImage: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1770080902270-istockphoto-951973848-612x612.jpg?alt=media&token=ac1bef02-5a8f-4540-ad76-6d366bf88087"
  },
  {
    slug: "aetna",
    name: "Aetna Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477424884-5e2b0177944ba5e6-1779477424883-955c129d-aetna-logo.png?alt=media&token=71eab5fb-ddbc-42de-ac41-635337b05999",
    tagline: "Insurance Heritage Since 1853",
    founded: "1853",
    headquarters: "Hartford, Connecticut",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Aetna Life Insurance Company is a workplace-focused life and supplemental benefits carrier offering group life, disability, and voluntary coverage through employers nationwide. With more than 170 years of operating history dating to 1853, Aetna is one of the most enduring names in American insurance. The company has been a wholly owned subsidiary of CVS Health Corporation since 2018, serving tens of millions of members through integrated health, pharmacy, and insurance products.",
    history: "Aetna Life Insurance Company was incorporated on May 28, 1853, in Hartford, Connecticut, when the annuity department of the older Aetna Insurance Company was spun off under president Eliphalet Bulkeley. The company expanded across the late 19th and 20th centuries into group life, group disability, and employer benefit lines, becoming one of the largest diversified insurers in the country. On November 28, 2018, CVS Health Corporation completed its acquisition of Aetna, integrating the carrier into a Fortune 500 healthcare platform.",
    whyChoose: [
      "Over 170 years of continuous operating history dating to 1853",
      "A (Excellent) financial strength rating from A.M. Best",
      "Wholly owned subsidiary of CVS Health Corporation, a Fortune 500 company",
      "One of the longest-running group disability franchises in the U.S., dating to 1919",
      "Integrated employer benefits across life, disability, and supplemental health",
      "Headquartered in Hartford, Connecticut — the historic capital of U.S. insurance"
    ],
    products: [
      { name: "Group Term Life Insurance", description: "Employer-sponsored term life coverage with an accelerated death benefit option for eligible employees and dependents.", icon: "Shield" },
      { name: "Group Disability Insurance", description: "Short-term and long-term disability income protection issued through employer benefit plans.", icon: "Clock" },
      { name: "Accidental Death & Dismemberment", description: "Supplemental coverage paying a benefit for accidental death or qualifying dismemberment events.", icon: "Heart" },
      { name: "Voluntary Supplemental Benefits", description: "Employee-paid plans including accident, critical illness, and hospital indemnity coverage.", icon: "CheckCircle" }
    ],
    keyStats: [
      { label: "Years in Business", value: "170+" },
      { label: "Parent Company", value: "CVS Health" },
      { label: "Headquarters", value: "Hartford, CT" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "I called Aetna while sitting in the waiting room. Within 5 minutes I had an answer to my question. They even double-checked my coverage again. Very fast, friendly, knowledgeable service.", name: "Verified Policyholder", location: "Trustpilot Review" },
      { quote: "Aetna's final expense plan offers competitive underwriting for applicants with health conditions, and the phone application from home was easy.", name: "Licensed Insurance Professional", location: "Industry Review" }
    ],
    photos: [],
    videos: [],
    website: "https://www.aetna.com",
    heroImage: ""
  },
  {
    slug: "banner-life",
    name: "Banner Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477445351-87fa09e82283a1f0-1779477445351-567d429a-banner-life-insurance-j_l_-thomas-company-e1669266532352-1.png?alt=media&token=d9036873-9dd6-4154-acbf-1d994f8b5fdf",
    tagline: "Term Life Expertise Backed by Legal & General",
    founded: "1949",
    headquarters: "Frederick, Maryland",
    rating: "A+ (Under Review)",
    ratingAgency: "A.M. Best",
    overview: "Banner Life Insurance Company is a U.S. life insurer recognized for competitive term life coverage and flexible underwriting for high-coverage applicants. Operating as part of Legal & General America, Banner Life serves clients across 49 states and the District of Columbia through independent agents. The company is in the process of transitioning ownership from Legal & General Group to Meiji Yasuda Life Insurance Company, a pending acquisition announced in 2025.",
    history: "The company was originally chartered in 1949 as Government Employees Life Insurance Company. It was acquired by Legal & General Group in 1981 and renamed Banner Life Insurance Company in 1983. In 2011, Banner Life and its sister carrier William Penn unified under the Legal & General America brand. Today the company is one of the leading term life insurance providers in the U.S. brokerage market.",
    whyChoose: [
      "75+ years of operating history dating to 1949",
      "A+ (Superior) financial strength rating from A.M. Best",
      "Competitive term life coverage with a broad range of level-term durations",
      "Accelerated underwriting available for qualified applicants — no medical exam required",
      "High coverage capacity for affluent and high-net-worth clients",
      "Backed by Legal & General America with pending Meiji Yasuda acquisition"
    ],
    products: [
      { name: "Term Life Insurance", description: "Level-premium term coverage available in multiple duration options with competitive pricing.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Permanent coverage with flexible premiums and lifetime protection for long-term planning.", icon: "Lock" },
      { name: "No-Exam Term Life", description: "Accelerated underwriting for qualified applicants, often approved with no medical exam.", icon: "CheckCircle" },
      { name: "High-Coverage Term Life", description: "Large face amounts designed for high-net-worth families and estate planning needs.", icon: "TrendingUp" }
    ],
    keyStats: [
      { label: "Years in Business", value: "75+" },
      { label: "Financial Strength", value: "A+ (Under Review)" },
      { label: "Parent Company", value: "Legal & General America" },
      { label: "States Licensed", value: "49 + DC" }
    ],
    testimonials: [
      { quote: "Banner Life provided an excellent experience from start to finish. The application process was smooth, transparent, and very professional.", name: "Verified Customer", location: "Trustpilot Review" },
      { quote: "Efficient and pleasant. No wait time at all. Finished in 5 minutes! The customer service rep was proficient and the request was completed without fuss.", name: "Verified Policyholder", location: "Trustpilot Review" }
    ],
    photos: [],
    videos: [],
    website: "https://www.lgamerica.com",
    heroImage: ""
  },
  {
    slug: "chubb",
    name: "Chubb Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477418701-642b572ec3a2d2f3-1779477418701-3bd315fe-7d8e412f.png?alt=media&token=ba264fe1-aa40-4ee7-98d1-54dc0db3f309",
    tagline: "Global Insurance Excellence Since 1882",
    founded: "1882",
    headquarters: "New York, NY",
    rating: "A++ (Chubb Group)",
    ratingAgency: "A.M. Best",
    overview: "Chubb Life Insurance Company is the life insurance arm of Chubb Limited, one of the world's largest publicly traded property and casualty insurers. The company offers individual life coverage alongside accident and supplemental health products distributed through agents and brokers. With operations in approximately 54 countries and territories, Chubb pairs its life portfolio with deep global underwriting expertise across commercial and personal lines. The A++ rating reflects the consolidated Chubb Limited group, not necessarily the standalone US life entity.",
    history: "Chubb traces its origins to 1882, when Thomas Caldecot Chubb and his son Percy founded a marine underwriting business in New York City. The Chubb Corporation established Chubb Life Insurance Company of America in 1978 as a holding company for its life subsidiaries. In January 2016, ACE Limited acquired The Chubb Corporation and adopted the Chubb name, forming today's Chubb Limited — a diversified global insurer with over 140 years of heritage.",
    whyChoose: [
      "140+ years of operating history dating to 1882",
      "A++ (Superior) financial strength rating from A.M. Best",
      "Backed by Chubb Limited, one of the world's largest publicly traded insurers",
      "Global operations across approximately 54 countries and territories",
      "Diversified portfolio spanning life, accident, and supplemental health",
      "Distribution through independent agents and brokers worldwide"
    ],
    products: [
      { name: "Term Life Insurance", description: "Level-premium coverage providing a guaranteed death benefit for a fixed term.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent lifelong coverage with guaranteed cash value accumulation.", icon: "Lock" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with adjustable premiums and death benefit within policy terms.", icon: "TrendingUp" },
      { name: "Accident & Health", description: "Personal accident and supplemental health products complementing Chubb's life offerings.", icon: "Heart" }
    ],
    keyStats: [
      { label: "Years in Business", value: "140+" },
      { label: "Financial Strength", value: "A++ (Chubb Group)" },
      { label: "Headquarters", value: "New York, NY" },
      { label: "Parent Company", value: "Chubb Limited" }
    ],
    testimonials: [
      { quote: "The agent at Chubb assessed my claim quickly and the entire process was handled promptly and professionally.", name: "Verified Customer", location: "Trustpilot Review" },
      { quote: "Customer reviews consistently highlight Chubb's exceptional agent service and user-friendly digital platform, reinforcing the carrier's reputation across its global operations.", name: "Insurance Industry Analyst", location: "Industry Review (2024)" }
    ],
    photos: [],
    videos: [],
    website: "https://www.chubb.com",
    heroImage: ""
  },
  {
    slug: "foresters",
    name: "Foresters Financial (The Independent Order of Foresters)",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477584995-280f064c6418d41c-1779477584995-76c8a81e-foresters_financial_logo_svg.png?alt=media&token=906d8f3b-964e-484c-acd4-8fe677a0896b",
    tagline: "Member-Focused Protection Since 1874",
    founded: "1874",
    headquarters: "Toronto, Ontario, Canada",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Foresters Financial is the trade name for The Independent Order of Foresters, the oldest non-denominational fraternal benefit society in North America. As a fraternal benefit society, it is owned by and operated for the benefit of its members rather than shareholders. The organization serves approximately 2.6 million members across the U.S., Canada, and the United Kingdom, pairing life insurance with scholarships, community grants, and member benefits.",
    history: "Foresters was founded in 1874 in Newark, New Jersey, by Col. Alonzo B. Caldwell as an independent North American branch of the fraternal Foresters movement. The organization expanded into Canada in 1875 and was formally incorporated under Canadian law in 1881, establishing its long-running headquarters in Toronto. In 2024, Foresters marked its 150th anniversary as an international fraternal society operating across three countries.",
    whyChoose: [
      "150+ years of operating history dating to 1874",
      "Fraternal benefit society — owned by and operated for members, not shareholders",
      "A (Excellent) financial strength rating from A.M. Best, affirmed for 25 consecutive years",
      "Member benefits beyond insurance, including scholarships and community volunteer grants",
      "International presence across the U.S., Canada, and the U.K.",
      "Independently rated A by Morningstar DBRS for additional financial strength confirmation"
    ],
    products: [
      { name: "Term Life Insurance", description: "Level-term coverage in 10, 20, and 30-year options with guaranteed level premiums.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent lifelong coverage with tax-deferred cash value accumulation.", icon: "Lock" },
      { name: "Universal Life Insurance", description: "Permanent coverage with flexible premiums and an adjustable death benefit.", icon: "TrendingUp" },
      { name: "Final Expense Insurance", description: "Small-face-amount whole life coverage designed for funeral and end-of-life costs.", icon: "Heart" }
    ],
    keyStats: [
      { label: "Years in Business", value: "150+" },
      { label: "Members Served", value: "2.6M+" },
      { label: "Headquarters", value: "Toronto, ON" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "I had a very positive experience and received excellent service. The financial information provided was clear, detailed, and easy to understand, with professionalism and transparency throughout.", name: "Verified Member", location: "Trustpilot Review" },
      { quote: "Our agent explained our account, answered all our questions, and encouraged us to use our membership benefits. The fraternal community grants and volunteer opportunities are a real differentiator.", name: "Verified Policyholder", location: "Trustpilot Review" }
    ],
    photos: [],
    videos: [],
    website: "https://www.foresters.com",
    heroImage: ""
  },
  {
    slug: "globe-life",
    name: "Globe Life And Accident Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477603129-be1449bbb948bcf0-1779477603129-8c111d5a-globe_life_logo_svg.png?alt=media&token=cf24a7ed-001d-468b-ae35-174082630c51",
    tagline: "Affordable Coverage for American Families",
    founded: "1951",
    headquarters: "McKinney, Texas",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Globe Life And Accident Insurance Company is a McKinney, Texas-based life insurer specializing in affordable coverage for middle-income American families. The company offers term, whole life, final expense, and mortgage protection products with simplified-issue underwriting. As the flagship subsidiary of Globe Life Inc., the company has built a national footprint serving households across the United States with straightforward, accessible protection.",
    history: "Globe Life was chartered in 1951 in Oklahoma City, Oklahoma, by Ralph Reece and John Singletary with $60,000 of borrowed capital, originally selling low-cost life protection to rural communities. By the mid-1960s the company was marketing policies across more than 30 states. Acquired into the Torchmark Corporation family in 1980, the parent rebranded as Globe Life Inc. in 2019. The operating subsidiary is today headquartered in McKinney, Texas.",
    whyChoose: [
      "70+ years of operating history dating to 1951",
      "A (Excellent) financial strength rating from A.M. Best",
      "Specialist in mortgage protection and final expense coverage",
      "Affordable policies with simplified-issue options for everyday families",
      "Publicly traded parent company on the New York Stock Exchange",
      "Broad multi-state licensing with a focus on middle-income households"
    ],
    products: [
      { name: "Term Life Insurance", description: "Level-premium term coverage providing affordable death benefit protection during working years.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent coverage with guaranteed level premiums and tax-deferred cash value growth.", icon: "Lock" },
      { name: "Final Expense Insurance", description: "Simplified-issue whole life designed to cover funeral and end-of-life expenses.", icon: "Heart" },
      { name: "Mortgage Protection Insurance", description: "Term coverage built to help families pay off the mortgage if the insured passes away.", icon: "Clock" }
    ],
    keyStats: [
      { label: "Years in Business", value: "70+" },
      { label: "Financial Strength", value: "A Rated" },
      { label: "Headquarters", value: "McKinney, TX" },
      { label: "Parent Company", value: "Globe Life Inc." }
    ],
    testimonials: [
      { quote: "My experience with Globe Life has been excellent. The customer service department is very understanding and they actually genuinely care about their customers.", name: "Verified Policyholder", location: "Globe Life Customer Reviews (2026)" },
      { quote: "I will highly recommend Globe Life. I had no problem when it came to filing my insurance claim — the process was quick and the team kept me informed.", name: "Verified Customer", location: "Globe Life Customer Reviews (2025)" }
    ],
    photos: [],
    videos: [],
    website: "https://www.globelifeinsurance.com",
    heroImage: ""
  },
  {
    slug: "guarantee-trust",
    name: "Guarantee Trust Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477412459-c9bb79ff5c233d65-1779477412458-ac12eae6-5d94cde1ce897b57ada207e7_logo-gtl.png?alt=media&token=e9835113-f6db-4fcb-bf80-872f76711b9f",
    logoSize: "large",
    tagline: "Supplemental Protection and Final Expense Specialists",
    founded: "1936",
    headquarters: "Glenview, Illinois",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Guarantee Trust Life Insurance Company is a privately held, family-owned life and health insurer headquartered in Glenview, Illinois. The company specializes in final expense, whole life, and supplemental health products including critical illness and hospital indemnity coverage. Distributed exclusively through independent general agencies and licensed in 49 states, GTL combines focused product expertise with three generations of family stewardship under the Holson family.",
    history: "GTL was founded in 1936 by Richard S. Holson during the Great Depression and has remained under the stewardship of three generations of the Holson family. The company originally operated from Chicago before relocating its home office to Glenview, Illinois. In October 2024, A.M. Best upgraded GTL's Financial Strength Rating to A (Excellent), recognizing its disciplined growth across supplemental health, final expense, and special risk insurance.",
    whyChoose: [
      "89+ years of operating history dating to 1936",
      "A (Excellent) financial strength rating from A.M. Best, upgraded October 2024",
      "Privately held and family-owned across three generations",
      "Specialist in supplemental health and final expense insurance",
      "Licensed in 49 states (all except New York)",
      "Exclusive General Agency distribution with hands-on service"
    ],
    products: [
      { name: "Final Expense Whole Life", description: "Simplified-issue whole life designed to cover funeral, burial, and end-of-life expenses.", icon: "Heart" },
      { name: "Whole Life Insurance", description: "Permanent coverage with guaranteed level premiums and tax-deferred cash value growth.", icon: "Lock" },
      { name: "Critical Illness Insurance", description: "Lump-sum supplemental benefits triggered by qualifying events like heart attack or stroke.", icon: "Shield" },
      { name: "Hospital Indemnity Insurance", description: "Fixed-benefit coverage paying for hospital confinement to help offset copays and deductibles.", icon: "CheckCircle" }
    ],
    keyStats: [
      { label: "Years in Business", value: "89+" },
      { label: "Financial Strength", value: "A Rated" },
      { label: "Headquarters", value: "Glenview, IL" },
      { label: "States Licensed", value: "49" }
    ],
    testimonials: [
      { quote: "Your people are so pleasant and caring when you speak to them. They put your mind at ease, keep their word, return phone calls, and get results quickly. I truly appreciate GTL.", name: "Verified Policyholder", location: "GTL Customer Testimonial" },
      { quote: "The GTL hospital indemnity plan is by far our favorite on the market — competitively priced with options that let us customize a plan for each client's exact needs. There hasn't been a rate increase on Advantage Plus in 18 years.", name: "Senior Insurance Broker", location: "Senior Benefit Services Industry Review" }
    ],
    photos: [],
    videos: [],
    website: "https://www.gtlic.com",
    heroImage: ""
  },
  {
    slug: "instabrain",
    name: "Fidelity Life Association — InstaBrain",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477575205-5cd55096c61d5d02-1779477575204-2847c37b-favicon.png?alt=media&token=38348e6e-c9ad-4334-ab09-b93facfe039c",
    logoSize: "xl",
    tagline: "Instant-Decision Life Insurance",
    founded: "1896",
    headquarters: "Des Plaines, Illinois",
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "Fidelity Life Association is a Chicago-area legal reserve life insurer with more than 125 years of operating history, offering term, whole life, and final expense coverage. Its InstaBrain platform layers AI-driven instant-decision underwriting on top of Fidelity Life policies for a fast, fully digital application experience. Following a 2024 acquisition by iA American Holdings, Fidelity Life is now backed by iA Financial Corporation, one of North America's largest insurance groups.",
    history: "Fidelity Life Association was founded on February 24, 1896, in Chicago as a legal reserve life insurance organization. Over a century later, the carrier evolved into a digital-first insurer emphasizing accelerated underwriting and online distribution through its RAPIDecision product line. In 2024, A.M. Best affirmed an A- (Excellent) rating with a positive outlook following the carrier's acquisition by iA American Holdings.",
    whyChoose: [
      "125+ years of operating history dating to 1896",
      "A- (Excellent) financial strength rating from A.M. Best, affirmed 2024",
      "InstaBrain digital platform with instant-decision underwriting",
      "RAPIDecision accelerated underwriting can return approvals in 24-48 hours",
      "Backed by iA Financial Corporation following 2024 acquisition",
      "Term, whole life, and final expense coverage in a single digital experience"
    ],
    products: [
      { name: "RAPIDecision Term Life", description: "Accelerated-underwriting term coverage with 10-30 year terms and face amounts up to $400,000.", icon: "Shield" },
      { name: "Whole Life Insurance", description: "Permanent coverage with guaranteed level premiums and tax-deferred cash value accumulation.", icon: "Lock" },
      { name: "Final Expense Insurance", description: "Simplified-issue whole life designed to cover funeral and end-of-life costs for seniors.", icon: "Heart" },
      { name: "InstaBrain Instant Decision", description: "AI-powered digital underwriting delivering same-session approvals with no medical exam.", icon: "Zap" }
    ],
    keyStats: [
      { label: "Years in Business", value: "129+" },
      { label: "Financial Strength", value: "A- Rated" },
      { label: "Headquarters", value: "Des Plaines, IL" },
      { label: "Parent Company", value: "iA Financial Corporation" }
    ],
    testimonials: [
      { quote: "My agent was very patient and explained my options thoroughly. He worked with me to find an affordable policy I could pay even on a fixed income.", name: "Verified Policyholder", location: "Fidelity Life Customer Reviews" },
      { quote: "I was shopping around looking for a reasonable price, but I also wanted a company with a good reputation. Fidelity Life made the process really easy, and I can tell they care about me.", name: "Verified Customer", location: "Trustpilot Review" }
    ],
    photos: [],
    videos: [],
    website: "https://fidelitylife.com",
    heroImage: ""
  },
  {
    slug: "lafayette-life",
    name: "The Lafayette Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477622815-5743fd1ba0cbde3a-1779477622815-55f0b238-lafayette-life-png-1.png?alt=media&token=a29a1ae5-fb83-410a-9c6f-06de7a02efcb",
    logoSize: "large",
    tagline: "Participating Whole Life Since 1905",
    founded: "1905",
    headquarters: "Cincinnati, OH",
    rating: "A+",
    ratingAgency: "A.M. Best",
    overview: "The Lafayette Life Insurance Company is a member of Western & Southern Financial Group, a Cincinnati-based Fortune 500 diversified financial services organization. Lafayette Life specializes in dividend-eligible whole life, term life, and fixed and indexed annuity products distributed through independent agents. With over 120 years of operating history and an A+ (Superior) rating from A.M. Best, the company is recognized for its long dividend payment record and consistent financial strength.",
    history: "Lafayette Life was founded on December 26, 1905, in Lafayette, Indiana, when its Articles of Incorporation established it as a mutual life insurance company. In 2000, the company reorganized into a Mutual Insurance Holding Company structure. In June 2005, Lafayette Life aligned with Western & Southern Financial Group, becoming a wholly owned subsidiary while retaining its brand and product focus. Today the company is headquartered in Cincinnati alongside its parent group.",
    whyChoose: [
      "120+ years of operating history dating to 1905",
      "A+ (Superior) financial strength rating from A.M. Best",
      "Member of Western & Southern Financial Group, a Fortune 500 organization",
      "Dividend-eligible whole life policies with a long payment history",
      "Specialist in permanent life, term, and fixed/indexed annuities",
      "Distributed through independent agents nationwide"
    ],
    products: [
      { name: "Whole Life Insurance", description: "Dividend-eligible permanent coverage with guaranteed level premiums and tax-deferred cash value.", icon: "Lock" },
      { name: "Term Life Insurance", description: "Level-premium term coverage providing affordable death benefit protection for a defined period.", icon: "Shield" },
      { name: "Fixed Indexed Annuities", description: "Single-premium annuities with crediting tied to market indices and downside protection of principal.", icon: "TrendingUp" },
      { name: "Immediate Annuities", description: "Single-premium products offering guaranteed lifetime income or income for a defined period.", icon: "DollarSign" }
    ],
    keyStats: [
      { label: "Years in Business", value: "120+" },
      { label: "Financial Strength", value: "A+ Rated" },
      { label: "Parent Company", value: "Western & Southern" },
      { label: "Headquarters", value: "Cincinnati, OH" }
    ],
    testimonials: [
      { quote: "Lafayette Life has quietly built one of the strongest whole life platforms in the industry, particularly for clients who plan to actively use policy loans. Their non-direct recognition means cash value keeps earning full dividends even with outstanding loans.", name: "Insurance Professional", location: "Insurance & Estates Carrier Review (2026)" },
      { quote: "121 consecutive years of paying dividends, with a 2026 dividend rate increase to 5.9%. Triple-A financial ratings put Lafayette in an elite group — only 9 of 750+ life carriers meet that bar.", name: "Licensed Producer", location: "NFG Brokerage Industry Analysis" }
    ],
    photos: [],
    videos: [],
    website: "https://www.westernsouthern.com/lafayette",
    heroImage: ""
  },
  {
    slug: "trinity-life",
    name: "Trinity Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477643668-2ae455c7972edf7d-1779477643668-e5d735b2-tlic_png.webp?alt=media&token=4cc5c46f-5b93-442c-ad00-b026cc3cfba2",
    logoSize: "large",
    tagline: "Focused Final Expense Solutions",
    founded: "1997",
    headquarters: "Tulsa, Oklahoma",
    rating: "B++",
    ratingAgency: "A.M. Best",
    overview: "Trinity Life Insurance Company is a Tulsa, Oklahoma-based life insurer specializing in final expense and burial coverage for the senior market. The carrier offers simplified-issue whole life products with immediate death benefit options, alongside term life and fixed annuities. As a subsidiary of First Trinity Financial Corporation, Trinity Life operates with its Family Benefit Life subsidiary across 27 states with a focused, senior-first product set.",
    history: "Trinity Life Insurance Company was established in 1997 in Tulsa, Oklahoma, as a subsidiary of First Trinity Financial Corporation. The company built its book of business primarily around final expense and simplified-issue whole life products targeted at seniors. Over time, Trinity Life expanded its state footprint through its own underwriting and through its Family Benefit Life subsidiary, today serving applicants across 27 states.",
    whyChoose: [
      "B++ (Good) financial strength rating from A.M. Best",
      "Specialist in final expense and burial coverage for seniors",
      "Simplified-issue whole life with immediate death benefit options",
      "BBB Accredited since 2007 with an A+ Better Business Bureau rating",
      "Subsidiary of First Trinity Financial Corporation",
      "Licensed in 27 states across the central, southern, and midwestern U.S."
    ],
    products: [
      { name: "Golden Eagle Final Expense", description: "Simplified-issue whole life with coverage from $2,500 to $25,000 and immediate death benefit options.", icon: "Heart" },
      { name: "Senior Whole Life", description: "Permanent coverage with guaranteed level premiums and tax-deferred cash value designed for seniors.", icon: "Lock" },
      { name: "Simplified Issue Term Life", description: "Affordable term coverage with simplified underwriting and no medical exam required.", icon: "Shield" },
      { name: "Fixed Annuities", description: "Tax-deferred annuities offering guaranteed growth and predictable retirement income.", icon: "TrendingUp" }
    ],
    keyStats: [
      { label: "Years in Business", value: "28+" },
      { label: "Financial Strength", value: "B++ Rated" },
      { label: "Headquarters", value: "Tulsa, OK" },
      { label: "States Licensed", value: "27" }
    ],
    testimonials: [
      { quote: "Trinity Life is one of the strongest companies I work with. When it fits your needs, it's often my top recommendation due to its affordability, simplicity, and reliability.", name: "Long-term Agent", location: "InsuranceForBurial.com Industry Review (2025)" },
      { quote: "The Golden Eagle Final Expense plan combines straightforward approval with no doctor visits or medical tests, and graded-benefit options are available. They're one of the few carriers that write applicants over age 80.", name: "Insurance Professional", location: "PinnacleQuote Industry Review" }
    ],
    photos: [],
    videos: [],
    website: "https://trinitylifeinsurance.com",
    heroImage: ""
  },
  {
    slug: "united-home-life",
    name: "United Home Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/documents%2Fimages%2F59af1d59-9900-429a-98b8-f78b795977bc%2F1779477655506-3a0a964550188aba-1779477655506-ebd73135-unitedhomelife-logo.png?alt=media&token=0dc97c19-36f3-4d7e-9516-a55fcc4b93c9",
    tagline: "Simplified-Issue Coverage Since 1948",
    founded: "1948",
    headquarters: "Indianapolis, Indiana",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "United Home Life Insurance Company is an Indianapolis-based life insurer specializing in simplified-issue final expense and burial coverage for everyday families. The company offers no-medical-exam policies underwritten through a brief phone interview, with no blood work or medical records required. As a subsidiary of United Farm Family Life Insurance Company, United Home Life was upgraded to an A (Excellent) financial strength rating by A.M. Best in June 2025.",
    history: "United Home Life Insurance Company was founded in 1948 as a subsidiary of United Farm Family Life Insurance Company, which itself was established in 1937. The company has been headquartered in Indianapolis, Indiana since its founding. Over more than 75 years, United Home Life has built its niche around simplified-issue final expense coverage distributed through independent agents, earning an A (Excellent) rating from A.M. Best in June 2025.",
    whyChoose: [
      "75+ years of operating history dating to 1948",
      "A (Excellent) financial strength rating from A.M. Best, upgraded June 2025",
      "Specialist in final expense and burial coverage",
      "Simplified-issue products with no medical exam required",
      "Phone-interview underwriting — no blood, urine, or medical records",
      "Subsidiary of United Farm Family Life Insurance Company"
    ],
    products: [
      { name: "Express Issue Whole Life", description: "Graded-benefit final expense whole life with full benefit payable from year three onward.", icon: "Heart" },
      { name: "Express Issue Deluxe", description: "Simplified-issue whole life with immediate full-benefit coverage and no medical exam.", icon: "Lock" },
      { name: "Express Issue Premier", description: "Top-tier simplified-issue whole life for healthier applicants with same-day approval.", icon: "CheckCircle" },
      { name: "Simplified Issue Term Life", description: "No-medical-exam term coverage underwritten via phone interview and application only.", icon: "Shield" }
    ],
    keyStats: [
      { label: "Years in Business", value: "75+" },
      { label: "Financial Strength", value: "A Rated" },
      { label: "Headquarters", value: "Indianapolis, IN" },
      { label: "Parent Company", value: "United Farm Family Life" }
    ],
    testimonials: [
      { quote: "Great carrier with fantastic customer service and always available until later in the day.", name: "Verified Customer", location: "BBB Customer Review (2023)" },
      { quote: "United Home Life has a simplified application with no medical exam and simple health questions — even the newest agents can understand and sell them. Policyholders are satisfied with the responsiveness and willingness to assist during difficult times.", name: "Licensed Producer", location: "Ogletree Financial Industry Review" }
    ],
    photos: [],
    videos: [],
    website: "https://www.unitedhomelife.com",
    heroImage: ""
  }
];

// Helper function to get carrier by slug
export function getCarrierBySlug(slug: string): CarrierData | undefined {
  return carriers.find(c => c.slug === slug);
}

// Export carrier list for carousel with links. Carriers without an uploaded
// logo render as text placeholder cards in the same slot (see Home.tsx
// carousel renderer). Once a logo is uploaded for a carrier, the placeholder
// auto-upgrades to the image rendering — no carousel code change needed.
export const carrierLinks = carriers.map(c => ({
  name: c.name,
  logo: c.logo,          // may be ""
  size: c.logoSize,
  href: `/carriers/${c.slug}`,
}));
