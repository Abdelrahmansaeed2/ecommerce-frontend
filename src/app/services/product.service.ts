import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    { id: '1', name: 'Chronos Obsidian Edition', price: 450, category: 'Accessories', rating: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArZyeBSdZDCXgCjlUi_HAseRBB4hp_1eIscWcqpTW4tqUF9gP0PxmC2PgwL70QwwrEIXLFvyDtsNndHvaBdg1tuNQQk4_YLRdBGex6syaFjtA_SSaX3KNDb_8EGvmPOGCdYLu_vgwbeRNqI6Dj3x2F_awnEZkcEwSnvAkBmyv6HtCU3QP4RAIKSO_k5VJmb2Wg-6nGkjQZ2pITRo0aDzQ3Rqo1Cny5lHcKrT1AJvIddKsVXK1Ctagx_U87T1BPriZWV-eKKhu8D3w', description: 'Precision engineered timepiece featuring sapphire crystal and Italian leather.' },
    { id: '2', name: 'Ethical Silk Blouse', price: 210, category: 'Apparel', isLimited: true, rating: 4.8, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD46I6DCXo9a9rbWTdKu5EftkGtzpnZh2aBEAg2BV_uQvjobdRpip1NUiBxQvweQ32iOhoCQTagt1RyrKdSYFfzj5xhS9G-x4SwFakoD8NtG43H8jkbOO8qAFe_Jc8pk3RdttiwmfAhb3g6vXsLuo9luY3nGPvjC0koI5-BPCEzYxEGQTZJN6aEsSi6oOBmAWNDfmHAvD5vkexOPxcDxmPwBaR2peOM3aC3uGipYotjLU1tlxI1vmnWRzP-Io-LaSZevdTS5pthlY', description: 'Hand-woven peace silk with a natural luminous finish.' },
    { id: '3', name: 'Nordic Smart Hub', price: 325, category: 'Home Objects', rating: 4.9, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWrdxiqngnXnYU4oDgCVmbESncbJwGlzluKTj7WEGwRWR3pRUZEl1VlfmYnhPz-BMToPdBfFGXj9fGZhraDD0dF3BLEAz99OMIkUV6zcw94W1QuwkFH8e5GByrT0sGEFVh8v6pIG9vWEJ0ltAtUlQeMGriLfUBGryhmn0gfldqomTh7gKc7hABcXpQbXdtWq_cDokr7BxU23P9YncVn0JfeYmx79GeRW6oJlACU-UVK1Au9X8fCwMJyIYENeS_9rU_LEAt_xpHU4w', description: 'Seamless home integration with minimalist sculptural design.' },
    { id: '4', name: 'Essence No. 04', price: 185, category: 'Fragrance', rating: 4.7, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV282yDykSkGvDrbMRVWLjDt8kyhIyYpzuZ45jrrTi8KdFgjZF8h-Otq-qhCp0FcTbx53k5Lnk3yKiMowEn659AnnCw1b59H5Tud4YQAC-5Ex8cEuzINmsnSWirsWYiiaLX50STSeV41Row8kPWzSnbRkrDt44QQLwM_f_txK6S96WBuTqdCVmFIlCvRiD2-1Gvk55ubhgRxe7iiA3cC1dWf6QBCDtWeKmOzToQe71mvlTuj0NH5ccb6kuHDlClk3EQ9SatBQROaA', description: 'Notes of santal, smoked vetiver, and morning dew.' },
    { id: '5', name: 'Artisan Dinner Set', price: 120, category: 'Home Objects', rating: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANm9NaAq31GbeoZjX27XhZL_l0pm1ompGek266rAwrUIBlB1inMw3xLOxvyZsmajFeDPWJHRvj6IcCxrkrsl70IXVFaNDCPr8RAWZq_RvnYh-JUgKu2egE100gFmhWmNTk6eDe0PuCGuVtO8AI5RDv6GVnqrA_KLV7u25zLJdfFF80tKeVmg2RDEzNtZPgqu7R-U-B6BgFml69zdCRwXyfMpKr_f7R56IJ0w08ZNlt_pbmApGKtazkcRq6wcEOWg3o-yDE_z-nlBg', description: 'Matte finish ceramic stoneware, set of 4 plates.' },
    { id: '6', name: 'Apex Velocity V2', price: 195, category: 'Apparel', rating: 4.6, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0NFUECwqKa3eg_2wVEm7NDZFFXT6sxbBChCcxM0UxWS9lX2tzTC7_AYX6jfgfVjYucy4myiemHAJOGevKJMncBmVaEUg-n1T3S9uF5z8IY2rT-c3n5zPnID_c9ji2Iz5lRsIxaI-5HaDybGgqpkKsY2ktujmRWPaPQBYA_TJiSt28_jywfQVUauMYYUHG-QRtLhDzvM-sX_1LRA_ftImz7aDkEMashmVF8vu3SYcCBqYRE3-pa-hPVgCA57qdNf6hAepyIkbL2gM', description: 'Ultra-lightweight performance runner with recycled mesh.' }
  ];

  getProducts() { return this.products; }
  getProductById(id: string) { return this.products.find(p => p.id === id); }
  searchProducts(query: string) {
    if(!query) return this.products;
    return this.products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  }
}
