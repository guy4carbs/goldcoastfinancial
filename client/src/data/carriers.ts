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
  website: string;
  heroImage: string;
}

export const carriers: CarrierData[] = [
  {
    slug: "americo",
    name: "Americo Financial Life and Annuity Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba",
    tagline: "Protecting American Families Since 1981",
    founded: "1981",
    headquarters: "Kansas City, Missouri",
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "Americo Financial Life and Annuity Insurance Company is a leading provider of life insurance and annuity products, dedicated to helping American families achieve financial security. With over four decades of experience, Americo has built a reputation for reliability, competitive products, and exceptional customer service.",
    history: "Founded in 1981, Americo has grown from a regional insurer to a national leader in the life insurance industry. The company's commitment to innovation and customer-first approach has enabled it to adapt to changing market conditions while maintaining its core mission of protecting families. Today, Americo serves millions of policyholders across the United States through a network of dedicated independent agents.",
    whyChoose: [
      "A- (Excellent) rating from A.M. Best demonstrates strong financial stability",
      "Over 40 years of experience protecting American families",
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
      { label: "Years in Business", value: "43+" },
      { label: "Policyholders Served", value: "2M+" },
      { label: "Claims Paid", value: "$5B+" },
      { label: "Financial Strength", value: "A- Rated" }
    ],
    testimonials: [
      { quote: "Americo made getting life insurance so simple. The application process was straightforward and I was approved within days.", name: "Robert M.", location: "Texas" },
      { quote: "When my husband passed, Americo processed our claim quickly and compassionately. They were there when we needed them most.", name: "Linda S.", location: "Florida" }
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
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Athene is one of the largest providers of retirement savings products in the United States, specializing in fixed annuities and life insurance solutions. As a subsidiary of Apollo Global Management, Athene combines innovative product design with strong financial backing to deliver exceptional value to policyholders.",
    history: "Founded in 2009, Athene has rapidly grown to become a leader in the retirement savings industry. The company's focus on operational excellence and customer-centric product development has driven its success. In 2022, Athene merged with Apollo Global Management, creating one of the largest financial services firms in the world with over $500 billion in assets under management.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best reflects superior financial strength",
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
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Athene's fixed indexed annuity gave me the growth potential I wanted with the security I needed. Best decision for my retirement.", name: "James T.", location: "Arizona" },
      { quote: "The guaranteed income from my Athene annuity gives me peace of mind knowing I'll never outlive my savings.", name: "Margaret R.", location: "Ohio" }
    ],
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
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "Baltimore Life Insurance Company is one of America's oldest and most respected life insurance providers, with over 140 years of experience protecting families. Known for competitive final expense and simplified issue products, Baltimore Life combines traditional values with modern convenience.",
    history: "Founded in Baltimore, Maryland in 1882, Baltimore Life has weathered economic storms, world wars, and market changes while consistently fulfilling its promises to policyholders. The company's longevity speaks to its conservative financial management and unwavering commitment to its mission. Today, Baltimore Life continues to serve families across the nation with the same dedication that has defined it for over a century.",
    whyChoose: [
      "Over 140 years of continuous operation and financial stability",
      "A- (Excellent) rating from A.M. Best",
      "Specialization in final expense and simplified issue products",
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
      { label: "Families Protected", value: "500K+" },
      { label: "Financial Strength", value: "A- Rated" }
    ],
    testimonials: [
      { quote: "At 72, I thought getting life insurance would be impossible. Baltimore Life approved me in just two days with no medical exam.", name: "Dorothy K.", location: "Pennsylvania" },
      { quote: "My agent from Baltimore Life took the time to explain everything. I finally have peace of mind knowing my family is protected.", name: "William B.", location: "Virginia" }
    ],
    website: "https://www.baltimorelife.com",
    heroImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80"
  },
  {
    slug: "corebridge",
    name: "Corebridge Financial",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    tagline: "Building Stronger Financial Futures",
    founded: "1919",
    headquarters: "Houston, Texas",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Corebridge Financial (formerly AIG Life & Retirement) is a leading provider of retirement solutions and life insurance products. With over a century of experience and $350+ billion in assets under management, Corebridge helps millions of Americans plan for and live in retirement with confidence.",
    history: "Corebridge Financial traces its roots to 1919 as part of the American International Group (AIG). In 2022, the company was spun off as an independent publicly traded company, taking the name Corebridge Financial. This new chapter allows Corebridge to focus exclusively on retirement and life insurance solutions while building on over 100 years of industry expertise.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best demonstrates exceptional financial strength",
      "Over 100 years of experience in financial services",
      "$350+ billion in assets under management",
      "Comprehensive suite of retirement and life insurance products",
      "Industry-leading fixed and variable annuity options",
      "Strong distribution network of financial professionals",
      "Commitment to innovation and digital customer experience"
    ],
    products: [
      { name: "Fixed Indexed Annuities", description: "Tax-deferred growth with downside protection and upside potential linked to market indexes.", icon: "TrendingUp" },
      { name: "Variable Annuities", description: "Investment flexibility with a range of professionally managed portfolios.", icon: "BarChart" },
      { name: "Term Life Insurance", description: "Affordable protection for 10, 15, 20, or 30 years.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with cash value accumulation.", icon: "Lock" }
    ],
    keyStats: [
      { label: "Assets Under Management", value: "$350B+" },
      { label: "Years of Experience", value: "100+" },
      { label: "Customers Served", value: "16M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Corebridge's retirement planning tools helped me understand exactly how much I needed to save. Now I'm on track for the retirement I've always dreamed of.", name: "Michael H.", location: "California" },
      { quote: "The flexibility of my Corebridge universal life policy has been invaluable. I can adjust my coverage as my needs change.", name: "Susan P.", location: "New York" }
    ],
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
      { quote: "Mutual of Omaha has been protecting my family for three generations. Their reliability is unmatched.", name: "Thomas L.", location: "Nebraska" },
      { quote: "The claims process was so smooth during the hardest time of our lives. Mutual of Omaha truly cares about their customers.", name: "Karen W.", location: "Iowa" }
    ],
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
    rating: "A",
    ratingAgency: "A.M. Best (Carriers)",
    overview: "Ethos is a modern life insurance company that uses technology to make getting coverage fast, easy, and affordable. By eliminating medical exams for most applicants and streamlining the application process, Ethos has made life insurance accessible to millions of families who previously found the process too complicated.",
    history: "Founded in 2016 by entrepreneurs who saw how difficult it was for families to get life insurance, Ethos set out to reinvent the industry. Using advanced data analytics and a customer-first approach, Ethos has removed traditional barriers to coverage. The company partners with top-rated carriers to offer policies that can be approved in minutes, not weeks.",
    whyChoose: [
      "10-minute online application with instant decisions",
      "No medical exam required for most applicants",
      "Policies issued by A-rated insurance carriers",
      "Coverage amounts from $20,000 to $8 million",
      "Competitive rates with transparent pricing",
      "Award-winning customer experience",
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
      { label: "Families Protected", value: "500K+" },
      { label: "Coverage Issued", value: "$50B+" },
      { label: "Carrier Rating", value: "A Rated" }
    ],
    testimonials: [
      { quote: "I was skeptical about online life insurance, but Ethos made it so easy. I was covered in under 10 minutes with no medical exam.", name: "Jessica M.", location: "Colorado" },
      { quote: "As a busy parent, I didn't have time for appointments and exams. Ethos let me get covered from my phone during my lunch break.", name: "David R.", location: "Washington" }
    ],
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
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "Royal Neighbors of America is a unique fraternal benefit society that combines life insurance protection with a mission of community service. Founded by women for women over 125 years ago, Royal Neighbors continues to empower members and communities through financial security and philanthropic programs.",
    history: "Founded in 1895 by nine pioneering women in Rock Island, Illinois, Royal Neighbors of America was one of the first organizations to offer life insurance to women on the same terms as men. This spirit of empowerment continues today through the organization's mission to protect members financially while making a positive impact in communities across America.",
    whyChoose: [
      "Over 125 years of experience protecting families",
      "A- (Excellent) rating from A.M. Best",
      "Fraternal benefit society focused on member welfare",
      "Unique philanthropic programs and scholarships",
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
      { label: "Years in Business", value: "129+" },
      { label: "Members Served", value: "200K+" },
      { label: "Scholarships Awarded", value: "$2M+" },
      { label: "Financial Strength", value: "A- Rated" }
    ],
    testimonials: [
      { quote: "Royal Neighbors isn't just an insurance company—it's a community. I love that my premiums support scholarships and charitable programs.", name: "Patricia G.", location: "Illinois" },
      { quote: "As a woman, I appreciate Royal Neighbors' history of empowering women. They understand my needs.", name: "Maria C.", location: "Texas" }
    ],
    website: "https://www.royalneighbors.org",
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
  },
  {
    slug: "transamerica",
    name: "Transamerica",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d",
    logoSize: "large",
    tagline: "Building a Stronger Tomorrow",
    founded: "1906",
    headquarters: "Baltimore, Maryland",
    rating: "A",
    ratingAgency: "A.M. Best",
    overview: "Transamerica is one of the largest and most recognized life insurance companies in America, serving millions of customers with life insurance, retirement, and investment solutions. As part of Aegon, a global financial services leader, Transamerica brings over a century of experience and $400+ billion in assets under management.",
    history: "Founded in San Francisco in 1906, Transamerica has a storied history intertwined with American progress. The company's iconic pyramid headquarters became a symbol of strength and stability. Today, as part of the Aegon group, Transamerica continues to innovate while honoring its commitment to helping customers achieve their financial goals.",
    whyChoose: [
      "A (Excellent) rating from A.M. Best",
      "Over 115 years of industry experience",
      "$400+ billion in assets under management",
      "Part of Aegon, a global financial services leader",
      "Comprehensive suite of life and retirement products",
      "Strong online tools and customer resources",
      "Nationwide network of experienced agents"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage for 10, 15, 20, or 30 years with level premiums.", icon: "Shield" },
      { name: "Universal Life Insurance", description: "Flexible permanent coverage with adjustable premiums and death benefits.", icon: "Lock" },
      { name: "Indexed Universal Life", description: "Cash value growth potential linked to market indexes with downside protection.", icon: "TrendingUp" },
      { name: "Fixed Annuities", description: "Guaranteed interest rates for secure retirement income.", icon: "DollarSign" }
    ],
    keyStats: [
      { label: "Years in Business", value: "118+" },
      { label: "Assets Managed", value: "$400B+" },
      { label: "Customers Served", value: "10M+" },
      { label: "Financial Strength", value: "A Rated" }
    ],
    testimonials: [
      { quote: "Transamerica's indexed universal life policy gave me the perfect combination of protection and growth potential. Highly recommend!", name: "Christopher B.", location: "Georgia" },
      { quote: "I've been a Transamerica customer for 25 years. Their stability and service have never wavered.", name: "Elizabeth N.", location: "Florida" }
    ],
    website: "https://www.transamerica.com",
    heroImage: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=1200&q=80"
  },
  {
    slug: "american-home-life",
    name: "American Home Life Insurance Company",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
    logoSize: "large",
    tagline: "Protecting Families with Care",
    founded: "1947",
    headquarters: "Kansas City, Missouri",
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "American Home Life Insurance Company specializes in final expense and simplified issue life insurance products, making coverage accessible to seniors and those who may have been declined elsewhere. With over 75 years of experience, the company has built a reputation for compassionate service and reliable protection.",
    history: "Founded in 1947, American Home Life has focused on serving the often-overlooked segments of the insurance market. The company pioneered simplified underwriting processes that allow seniors and those with health conditions to obtain meaningful coverage. Today, American Home Life continues its mission of making life insurance accessible to all Americans.",
    whyChoose: [
      "A- (Excellent) rating from A.M. Best",
      "Over 75 years specializing in simplified issue products",
      "Coverage available for ages 50-85",
      "No medical exam required",
      "Immediate coverage available on most policies",
      "Competitive rates for final expense coverage",
      "Compassionate claims handling"
    ],
    products: [
      { name: "Final Expense Insurance", description: "Whole life coverage specifically designed to cover funeral and burial costs.", icon: "Heart" },
      { name: "Simplified Issue Whole Life", description: "Permanent coverage with just a few health questions and no medical exam.", icon: "CheckCircle" },
      { name: "Guaranteed Issue Life", description: "Coverage available regardless of health with a modified benefit period.", icon: "Shield" },
      { name: "Senior Life Insurance", description: "Tailored coverage options for ages 50-85.", icon: "Users" }
    ],
    keyStats: [
      { label: "Years in Business", value: "77+" },
      { label: "Age Range Served", value: "50-85" },
      { label: "Application Time", value: "15 min" },
      { label: "Financial Strength", value: "A- Rated" }
    ],
    testimonials: [
      { quote: "After being declined by other companies due to my diabetes, American Home Life approved me quickly and at a fair rate.", name: "Harold J.", location: "Tennessee" },
      { quote: "The peace of mind knowing my final expenses are covered is priceless. Thank you, American Home Life.", name: "Ruth A.", location: "Kentucky" }
    ],
    website: "https://www.americanhomelife.com",
    heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
  },
  {
    slug: "polish-falcons",
    name: "Polish Falcons of America",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
    tagline: "A Polish-American Tradition Since 1887",
    founded: "1887",
    headquarters: "Pittsburgh, Pennsylvania",
    rating: "A-",
    ratingAgency: "A.M. Best",
    overview: "Polish Falcons of America is a fraternal benefit society that combines life insurance with a rich tradition of Polish-American culture and community service. For over 135 years, the organization has provided financial security to members while preserving and promoting Polish heritage.",
    history: "Founded in 1887 in Pittsburgh, Pennsylvania, Polish Falcons of America began as a physical fitness and cultural organization for Polish immigrants. The fraternal benefit component was added to provide financial protection for members and their families. Today, Polish Falcons continues this dual mission, offering competitive insurance products while celebrating Polish-American identity through cultural programs, scholarships, and community activities.",
    whyChoose: [
      "Over 135 years of serving Polish-American communities",
      "A- (Excellent) rating from A.M. Best",
      "Fraternal benefits beyond insurance",
      "Scholarships and cultural programs for members",
      "Competitive rates on life insurance products",
      "Strong community ties and local nests (chapters)",
      "Family-oriented organization with youth programs"
    ],
    products: [
      { name: "Whole Life Insurance", description: "Permanent protection with cash value and fraternal benefits.", icon: "Shield" },
      { name: "Term Life Insurance", description: "Affordable temporary coverage for specific needs.", icon: "Clock" },
      { name: "Juvenile Life Insurance", description: "Start building protection and savings for children early.", icon: "Users" },
      { name: "Final Expense Insurance", description: "Coverage designed for end-of-life costs.", icon: "Heart" }
    ],
    keyStats: [
      { label: "Years in Business", value: "137+" },
      { label: "Local Nests", value: "100+" },
      { label: "Scholarships Awarded", value: "$1M+" },
      { label: "Financial Strength", value: "A- Rated" }
    ],
    testimonials: [
      { quote: "Polish Falcons is more than insurance—it's family. My parents were members, and now my children are too.", name: "Stanislaw K.", location: "Pennsylvania" },
      { quote: "The scholarship from Polish Falcons helped me attend college. They invest in our community's future.", name: "Anna M.", location: "Illinois" }
    ],
    website: "https://www.polishfalcons.org",
    heroImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80"
  },
  {
    slug: "ladder",
    name: "Ladder Life Insurance",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733",
    tagline: "Smart Life Insurance",
    founded: "2017",
    headquarters: "Palo Alto, California",
    rating: "A",
    ratingAgency: "A.M. Best (Carriers)",
    overview: "Ladder is a technology-driven life insurance company that has reimagined how families get coverage. With instant online applications, flexible coverage that can be adjusted as life changes, and policies backed by top-rated insurers, Ladder makes life insurance smarter and more accessible.",
    history: "Founded in 2017 by former insurance executives and tech entrepreneurs, Ladder was built to solve the problem of flexibility in life insurance. The company introduced 'laddering'—the ability to instantly adjust coverage up or down as needs change—eliminating the need to cancel and reapply for new policies. This innovation has made Ladder a favorite among young families and professionals.",
    whyChoose: [
      "Instant coverage decisions in as little as 5 minutes",
      "Flexible coverage that adjusts as your life changes",
      "No medical exam required for coverage up to $3 million",
      "Policies backed by A-rated insurance carriers",
      "Industry-leading digital experience",
      "Transparent pricing with no hidden fees",
      "Award-winning customer satisfaction"
    ],
    products: [
      { name: "Term Life Insurance", description: "Coverage from 10 to 30 years with instant approval for most applicants.", icon: "Shield" },
      { name: "Flexible Term", description: "Unique laddering feature lets you adjust coverage without reapplying.", icon: "Sliders" },
      { name: "No-Exam Term", description: "Up to $3 million in coverage with no medical exam required.", icon: "CheckCircle" },
      { name: "Instant Issue", description: "Get covered today with same-day decisions.", icon: "Zap" }
    ],
    keyStats: [
      { label: "Average Approval Time", value: "5 min" },
      { label: "Max No-Exam Coverage", value: "$3M" },
      { label: "Coverage Flexibility", value: "Adjust anytime" },
      { label: "Carrier Rating", value: "A Rated" }
    ],
    testimonials: [
      { quote: "I love that I can adjust my coverage as my mortgage goes down. Ladder is the smartest life insurance out there.", name: "Brian P.", location: "California" },
      { quote: "From application to approval took less than 10 minutes. I couldn't believe how easy Ladder made getting life insurance.", name: "Stephanie K.", location: "Oregon" }
    ],
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
    rating: "A+",
    ratingAgency: "A.M. Best",
    overview: "Lincoln Financial Group is a Fortune 250 company and one of the largest life insurance and retirement services providers in America. With over 115 years of experience and $300+ billion in assets under management, Lincoln helps millions of customers protect their families and prepare for retirement.",
    history: "Founded in 1905 in Fort Wayne, Indiana, Lincoln Financial was named in honor of President Abraham Lincoln. The company has grown into a diversified financial services leader while maintaining its founding principles of integrity and customer focus. Today, Lincoln Financial serves millions of customers through a comprehensive range of life insurance, annuities, and retirement plan services.",
    whyChoose: [
      "A+ (Superior) rating from A.M. Best—one of the industry's highest",
      "Fortune 250 company with 115+ years of experience",
      "$300+ billion in assets under management",
      "Comprehensive life insurance product portfolio",
      "Industry-leading indexed universal life products",
      "Strong retirement planning solutions",
      "Excellent financial professional network"
    ],
    products: [
      { name: "Term Life Insurance", description: "Affordable coverage from 10 to 30 years with competitive rates.", icon: "Shield" },
      { name: "Indexed Universal Life", description: "Permanent coverage with cash value growth linked to market indexes.", icon: "TrendingUp" },
      { name: "Variable Universal Life", description: "Flexible coverage with investment options for cash value growth.", icon: "BarChart" },
      { name: "Fixed Annuities", description: "Guaranteed interest rates for stable retirement income.", icon: "DollarSign" }
    ],
    keyStats: [
      { label: "Years in Business", value: "119+" },
      { label: "Assets Managed", value: "$300B+" },
      { label: "Fortune Ranking", value: "Top 250" },
      { label: "Financial Strength", value: "A+ Rated" }
    ],
    testimonials: [
      { quote: "Lincoln Financial's IUL policy has been the cornerstone of my retirement planning. The growth has exceeded my expectations.", name: "Richard D.", location: "Pennsylvania" },
      { quote: "When my wife was diagnosed with a critical illness, Lincoln's living benefits provided funds when we needed them most.", name: "Janet S.", location: "New Jersey" }
    ],
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
