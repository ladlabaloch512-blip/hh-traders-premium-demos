// H.H Traders - shared product data. Edit names, prices, ratings and blurbs here; every design reads from this file.
window.HH_DATA = {
  store: {
    name: "H.H Traders",
    address: "Office # 14, Mumtaz Market, City Saddar Road, Rawalpindi",
    phones: ["0312 5488700", "0346 5814290"],
    whatsapp: "https://wa.me/923465814290",
    brands: ["SAFETY JOGGER", "MKT", "HORSE", "WORKSITE"]
  },
  categories: [
    { id: "fire", name: "Fire Fighting Equipment", img: "../shared/img/cat-fire.jpg" },
    { id: "safety", name: "Safety Items", img: "../shared/img/cat-safety.jpg" },
    { id: "support", name: "Hanging Support Systems", img: "../shared/img/cat-support.jpg" },
    { id: "hvac", name: "HVAC", img: "../shared/img/cat-hvac.jpg" },
    { id: "anchor", name: "Adhesive & Epoxy Anchoring", img: "../shared/img/cat-anchor.jpg" },
    { id: "tools", name: "Power Tools", img: "../shared/img/cat-tools.jpg" },
    { id: "general", name: "General Order Supplies", img: "../shared/img/cat-general.jpg" }
  ],
  products: [
    { id: 1, cat: "fire", name: "ABC Dry Powder Fire Extinguisher 6kg", price: 5850, rating: 4.8, blurb: "Stored-pressure ABC extinguisher for offices, warehouses and workshops. Wall bracket included." },
    { id: 2, cat: "fire", name: "CO2 Fire Extinguisher 5kg", price: 9200, rating: 4.7, blurb: "Carbon dioxide extinguisher for electrical rooms and server areas. Leaves no residue." },
    { id: 3, cat: "fire", name: "Fire Hose Reel 30m", price: 14500, rating: 4.6, blurb: "Swinging-type hose reel with 30 metre rubber hose and jet nozzle for commercial buildings." },
    { id: 4, cat: "safety", name: "Safety Jogger Safety Shoes", price: 6950, rating: 4.9, blurb: "Steel-toe safety shoes with anti-puncture midsole. Sizes 39 to 46 in stock." },
    { id: 5, cat: "safety", name: "Safety Helmet - Ratchet Adjustment", price: 850, rating: 4.5, blurb: "HDPE shell helmet with ratchet adjustment and sweat band. White, yellow and blue." },
    { id: 6, cat: "safety", name: "Fall Arrest Harness Full Body", price: 3400, rating: 4.7, blurb: "Full-body harness with dorsal D-ring and adjustable straps for work at height." },
    { id: 7, cat: "support", name: "Threaded Rod 10mm - 3m Length", price: 620, rating: 4.4, blurb: "Zinc-plated threaded rod for tray and duct supports. Sold per 3 metre length." },
    { id: 8, cat: "support", name: "Cable Tray 300mm - Perforated", price: 2100, rating: 4.5, blurb: "Perforated galvanised cable tray, 300mm wide, 2.4 metre lengths with couplers." },
    { id: 9, cat: "support", name: "Channel Strut 41x41 - 3m", price: 1650, rating: 4.6, blurb: "Slotted channel strut for pipe and HVAC supports. Nuts and clamps available." },
    { id: 10, cat: "hvac", name: "Refrigerant Manifold Gauge Set", price: 6800, rating: 4.8, blurb: "Two-valve manifold set for R22 and R410A with 36 inch charging hoses." },
    { id: 11, cat: "hvac", name: "Copper Pipe Coil 1/2 inch - 15m", price: 11500, rating: 4.6, blurb: "Soft copper coil for split AC installation, 1/2 inch outer diameter, 15 metre roll." },
    { id: 12, cat: "hvac", name: "HVAC Insulation Tape - Pack of 3", price: 450, rating: 4.3, blurb: "Foam insulation tape for pipe lagging and joint sealing. Three rolls per pack." },
    { id: 13, cat: "anchor", name: "MKT Injection Anchoring Adhesive", price: 2150, rating: 4.7, blurb: "Two-part injection mortar cartridge for heavy fixings in concrete and masonry." },
    { id: 14, cat: "anchor", name: "Anchor Studs M12 - Box of 25", price: 1750, rating: 4.5, blurb: "Grade 8.8 anchor studs with nuts and washers for chemical anchoring. Box of 25." },
    { id: 15, cat: "anchor", name: "Epoxy Repair Compound 500g", price: 980, rating: 4.4, blurb: "Two-part epoxy compound for concrete cracks, leaks and surface repair." },
    { id: 16, cat: "tools", name: "WORKSITE Cordless Drill 20V", price: 12500, rating: 4.8, blurb: "20V cordless drill driver with two batteries, charger and carry case." },
    { id: 17, cat: "tools", name: "Angle Grinder 4.5 inch - 850W", price: 5400, rating: 4.6, blurb: "850W angle grinder for cutting and grinding metal and stone. Side handle included." },
    { id: 18, cat: "tools", name: "Rotary Hammer Drill 26mm", price: 9800, rating: 4.7, blurb: "SDS-plus rotary hammer for concrete drilling and light chiselling. Three functions." },
    { id: 19, cat: "general", name: "Workshop Tool Kit 128 Pcs", price: 9900, rating: 4.9, blurb: "128 piece socket, spanner and driver set in a moulded case for workshop and site use." },
    { id: 20, cat: "general", name: "HORSE Work Gloves - Dozen", price: 1200, rating: 4.4, blurb: "Cotton knitted work gloves with grip dots. Sold per dozen pairs." },
    { id: 21, cat: "general", name: "Industrial Extension Reel 25m", price: 4600, rating: 4.5, blurb: "25 metre cable reel with four sockets, thermal cut-out and carry handle." }
  ],
  heroes: [
    { img: "../shared/img/hero-warehouse.jpg", kick: "Wholesale | Rawalpindi", title: "The Force Behind Every Build.", text: "Fire, safety, HVAC, anchoring and tools, stocked deep for contractors and factories.", cta: "Shop Now" },
    { img: "../shared/img/hero-tools.jpg", kick: "Power Tools", title: "The Tool Counter.", text: "Drills, grinders and full tool kits, checked before dispatch.", cta: "Shop Now" },
    { img: "../shared/img/hero-workers.jpg", kick: "Safety Items", title: "Safety, Made Simple.", text: "Helmets, harnesses and Safety Jogger shoes in all sizes.", cta: "Shop Now" }
  ]
};
