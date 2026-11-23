import type { Category, MenuItem, Vendor } from "./types";

/**
 * Sample data for the prototype. Vendors are fictional, prices are typical for Abeokuta,
 * ratings and prep times are illustrative. Photos come from Wikimedia Commons (credits below).
 * Generated from the dish list; replace with Supabase rows (see lib/api.ts).
 */
export const CATEGORIES: Category[] = [
  {
    "id": "rice",
    "label": "Rice dishes"
  },
  {
    "id": "soups",
    "label": "Soups"
  },
  {
    "id": "grills",
    "label": "Grills"
  },
  {
    "id": "fast-food",
    "label": "Fast food"
  },
  {
    "id": "swallow",
    "label": "Swallow"
  },
  {
    "id": "snacks",
    "label": "Snacks"
  },
  {
    "id": "drinks",
    "label": "Drinks"
  },
  {
    "id": "desserts",
    "label": "Desserts"
  }
];

export const VENDORS: Vendor[] = [
  {
    "id": "mama-tundes-buka",
    "name": "Mama Tunde's Buka",
    "area": "Alabata",
    "deliveryMinutes": [
      25,
      35
    ],
    "deliveryFee": 600,
    "rating": 4.7,
    "ratingCount": 412
  },
  {
    "id": "olumo-grills",
    "name": "Olumo Grills",
    "area": "Kuto",
    "deliveryMinutes": [
      30,
      45
    ],
    "deliveryFee": 800,
    "rating": 4.6,
    "ratingCount": 288
  },
  {
    "id": "ofada-and-co",
    "name": "Ofada & Co.",
    "area": "Oke-Ilewo",
    "deliveryMinutes": [
      30,
      40
    ],
    "deliveryFee": 700,
    "rating": 4.8,
    "ratingCount": 530
  },
  {
    "id": "lafenwa-shawarma-hub",
    "name": "Lafenwa Shawarma Hub",
    "area": "Lafenwa",
    "deliveryMinutes": [
      20,
      30
    ],
    "deliveryFee": 500,
    "rating": 4.5,
    "ratingCount": 356
  },
  {
    "id": "ronkes-snacks",
    "name": "Ronke's Snacks & Drinks",
    "area": "Ibara",
    "deliveryMinutes": [
      15,
      25
    ],
    "deliveryFee": 400,
    "rating": 4.6,
    "ratingCount": 190
  }
];

export const MENU: MenuItem[] = [
  {
    "id": "jollof-rice-chicken",
    "name": "Jollof Rice and Chicken",
    "vendorId": "ofada-and-co",
    "category": "rice",
    "price": 8500,
    "description": "Smoky Nigerian party jollof served with freshly grilled chicken and plantain.",
    "prepMinutes": 20,
    "rating": 4.8,
    "ratingCount": 326,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/jollof-rice-chicken.jpg",
      "alt": "Jollof rice with fried plantain and chicken on a plate",
      "credit": {
        "author": "Skarfmacaronne",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Jollof_rice_and_Dodo.jpg"
      }
    },
    "options": [
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-chicken",
            "label": "Chicken",
            "price": 0
          },
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-turkey",
            "label": "Turkey",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Fried fish",
            "price": 1000
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-dodo",
            "label": "Dodo (fried plantain)",
            "price": 800
          },
          {
            "id": "extras-moimoi",
            "label": "Moi moi",
            "price": 1000
          },
          {
            "id": "extras-egg",
            "label": "Boiled egg",
            "price": 300
          },
          {
            "id": "extras-coleslaw",
            "label": "Coleslaw",
            "price": 500
          }
        ]
      }
    ]
  },
  {
    "id": "fried-rice",
    "name": "Fried Rice",
    "vendorId": "ofada-and-co",
    "category": "rice",
    "price": 7500,
    "description": "Nigerian fried rice with sweet corn, carrots, green peas and liver, served with chicken.",
    "prepMinutes": 20,
    "rating": 4.6,
    "ratingCount": 241,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/fried-rice.jpg",
      "alt": "Fried rice with chicken, sweet corn, carrots and peas",
      "credit": {
        "author": "Bukky658",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Fried_rice_and_chicken_garnished_with_sweet_corn,_carrot_and_green_peas.jpg"
      }
    },
    "options": [
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-chicken",
            "label": "Chicken",
            "price": 0
          },
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-turkey",
            "label": "Turkey",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Fried fish",
            "price": 1000
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-dodo",
            "label": "Dodo (fried plantain)",
            "price": 800
          },
          {
            "id": "extras-moimoi",
            "label": "Moi moi",
            "price": 1000
          },
          {
            "id": "extras-egg",
            "label": "Boiled egg",
            "price": 300
          },
          {
            "id": "extras-coleslaw",
            "label": "Coleslaw",
            "price": 500
          }
        ]
      }
    ]
  },
  {
    "id": "ofada-rice-stew",
    "name": "Ofada Rice and Ofada Stew",
    "vendorId": "ofada-and-co",
    "category": "rice",
    "price": 8000,
    "description": "Local ofada rice served on a leaf with spicy ofada stew, locust beans and assorted meat.",
    "prepMinutes": 25,
    "rating": 4.7,
    "ratingCount": 198,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/ofada-rice-stew.jpg",
      "alt": "Ofada rice with stew served on a leaf",
      "credit": {
        "author": "Bukky658",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Ofada_Rice_and_stew_on_leaf.jpg"
      }
    },
    "options": [
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-assorted",
            "label": "Assorted meat",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Titus fish",
            "price": 1000
          },
          {
            "id": "protein-goat",
            "label": "Goat meat",
            "price": 1500
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-dodo",
            "label": "Dodo (fried plantain)",
            "price": 800
          },
          {
            "id": "extras-moimoi",
            "label": "Moi moi",
            "price": 1000
          },
          {
            "id": "extras-egg",
            "label": "Boiled egg",
            "price": 300
          },
          {
            "id": "extras-coleslaw",
            "label": "Coleslaw",
            "price": 500
          }
        ]
      }
    ]
  },
  {
    "id": "amala-ewedu",
    "name": "Amala and Ewedu",
    "vendorId": "mama-tundes-buka",
    "category": "swallow",
    "price": 6000,
    "description": "Soft amala with ewedu and gbegiri, finished with buka beef stew.",
    "prepMinutes": 15,
    "rating": 4.8,
    "ratingCount": 402,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/amala-ewedu.jpg",
      "alt": "Amala with ewedu soup and meat",
      "credit": {
        "author": "Bukky658",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Amala_and_Gbegiri_with_Ewedu_soup.jpg"
      }
    },
    "options": [
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-assorted",
            "label": "Assorted meat",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Titus fish",
            "price": 1000
          },
          {
            "id": "protein-goat",
            "label": "Goat meat",
            "price": 1500
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-extra-wrap",
            "label": "Extra wrap of swallow",
            "price": 500
          },
          {
            "id": "extras-ponmo",
            "label": "Ponmo",
            "price": 400
          }
        ]
      }
    ]
  },
  {
    "id": "pounded-yam-egusi",
    "name": "Pounded Yam and Egusi",
    "vendorId": "mama-tundes-buka",
    "category": "swallow",
    "price": 7500,
    "description": "Smooth pounded yam with thick egusi soup, leafy greens and your choice of protein.",
    "prepMinutes": 20,
    "rating": 4.7,
    "ratingCount": 315,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/pounded-yam-egusi.jpg",
      "alt": "Pounded yam with egusi soup",
      "credit": {
        "author": "Onyenachi64",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Egusi_soup_with_pounded_yam_and_assorted_meats.jpg"
      }
    },
    "options": [
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-assorted",
            "label": "Assorted meat",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Titus fish",
            "price": 1000
          },
          {
            "id": "protein-goat",
            "label": "Goat meat",
            "price": 1500
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-extra-wrap",
            "label": "Extra wrap of swallow",
            "price": 500
          },
          {
            "id": "extras-ponmo",
            "label": "Ponmo",
            "price": 400
          }
        ]
      }
    ]
  },
  {
    "id": "efo-riro",
    "name": "Efo Riro",
    "vendorId": "mama-tundes-buka",
    "category": "soups",
    "price": 6500,
    "description": "Rich Yoruba spinach stew with locust beans, peppers and assorted meat. Served with your choice of swallow.",
    "prepMinutes": 20,
    "rating": 4.6,
    "ratingCount": 187,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/efo-riro.jpg",
      "alt": "Efo riro vegetable stew",
      "credit": {
        "author": "Bukky658",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Efo_riro.jpg"
      }
    },
    "options": [
      {
        "id": "swallow",
        "name": "Choose your swallow",
        "type": "single",
        "choices": [
          {
            "id": "swallow-semo",
            "label": "Semo",
            "price": 0
          },
          {
            "id": "swallow-eba",
            "label": "Eba",
            "price": 0
          },
          {
            "id": "swallow-pounded-yam",
            "label": "Pounded yam",
            "price": 800
          }
        ]
      },
      {
        "id": "protein",
        "name": "Choose your protein",
        "type": "single",
        "choices": [
          {
            "id": "protein-beef",
            "label": "Beef",
            "price": 0
          },
          {
            "id": "protein-assorted",
            "label": "Assorted meat",
            "price": 1500
          },
          {
            "id": "protein-fish",
            "label": "Titus fish",
            "price": 1000
          },
          {
            "id": "protein-goat",
            "label": "Goat meat",
            "price": 1500
          }
        ]
      }
    ]
  },
  {
    "id": "goat-pepper-soup",
    "name": "Goat Meat Pepper Soup",
    "vendorId": "mama-tundes-buka",
    "category": "soups",
    "price": 5500,
    "description": "Light, peppery broth with tender goat meat, scent leaf and pepper soup spice.",
    "prepMinutes": 15,
    "rating": 4.5,
    "ratingCount": 143,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/goat-pepper-soup.jpg",
      "alt": "Goat meat pepper soup",
      "credit": {
        "author": "Nancy Nwachukwu",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Goat_meat_pepper_soup_served_with_bread.jpg"
      }
    },
    "options": [
      {
        "id": "side",
        "name": "Add a side",
        "type": "multi",
        "choices": [
          {
            "id": "side-bread",
            "label": "Agege bread",
            "price": 500
          },
          {
            "id": "side-white-rice",
            "label": "White rice",
            "price": 1200
          }
        ]
      }
    ]
  },
  {
    "id": "beef-suya",
    "name": "Beef Suya",
    "vendorId": "olumo-grills",
    "category": "grills",
    "price": 7000,
    "description": "Thin slices of beef grilled over open flame with yaji spice, served with onions and tomatoes.",
    "prepMinutes": 15,
    "rating": 4.9,
    "ratingCount": 455,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/beef-suya.jpg",
      "alt": "Beef suya with yaji pepper and sliced onions",
      "credit": {
        "author": "Bukky658",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Suya_with_pepper_sauce.jpg"
      }
    },
    "options": [
      {
        "id": "size",
        "name": "Portion",
        "type": "single",
        "choices": [
          {
            "id": "size-regular",
            "label": "Regular",
            "price": 0
          },
          {
            "id": "size-large",
            "label": "Large",
            "price": 3000
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-extra-yaji",
            "label": "Extra yaji",
            "price": 200
          },
          {
            "id": "extras-cabbage",
            "label": "Cabbage and cucumber",
            "price": 300
          }
        ]
      }
    ]
  },
  {
    "id": "grilled-chicken",
    "name": "Grilled Chicken",
    "vendorId": "olumo-grills",
    "category": "grills",
    "price": 9000,
    "description": "Half chicken marinated in suya spice and grilled until charred and juicy.",
    "prepMinutes": 25,
    "rating": 4.7,
    "ratingCount": 268,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/grilled-chicken.jpg",
      "alt": "Grilled chicken",
      "credit": {
        "author": "Fatimah Bello",
        "licence": "CC0",
        "url": "https://commons.wikimedia.org/wiki/File:Grilled_chicken_meat.jpg"
      }
    },
    "options": [
      {
        "id": "side",
        "name": "Choose a side",
        "type": "single",
        "choices": [
          {
            "id": "side-dodo",
            "label": "Dodo",
            "price": 0
          },
          {
            "id": "side-chips",
            "label": "Chips",
            "price": 0
          },
          {
            "id": "side-jollof",
            "label": "Jollof rice",
            "price": 1500
          }
        ]
      }
    ]
  },
  {
    "id": "asun",
    "name": "Asun (Peppered Goat Meat)",
    "vendorId": "olumo-grills",
    "category": "grills",
    "price": 6500,
    "description": "Smoked goat meat chopped and tossed in hot scotch bonnet pepper sauce.",
    "prepMinutes": 20,
    "rating": 4.6,
    "ratingCount": 164,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/asun.jpg",
      "alt": "Peppered goat meat",
      "credit": {
        "author": "Edriiic",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Goat_meat_Asun.jpg"
      }
    },
    "options": []
  },
  {
    "id": "chicken-shawarma",
    "name": "Chicken Shawarma",
    "vendorId": "lafenwa-shawarma-hub",
    "category": "fast-food",
    "price": 5500,
    "description": "Grilled chicken, cabbage, carrots and creamy sauce rolled in toasted flatbread.",
    "prepMinutes": 10,
    "rating": 4.5,
    "ratingCount": 389,
    "available": true,
    "bestSeller": true,
    "photo": {
      "src": "/food/chicken-shawarma.jpg",
      "alt": "Chicken shawarma wrap cut open",
      "credit": {
        "author": "Zebaarts",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Chicken_Shawarma.jpg"
      }
    },
    "options": [
      {
        "id": "size",
        "name": "Size",
        "type": "single",
        "choices": [
          {
            "id": "size-regular",
            "label": "Regular",
            "price": 0
          },
          {
            "id": "size-jumbo",
            "label": "Jumbo",
            "price": 1500
          }
        ]
      },
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-sausage",
            "label": "Extra sausage",
            "price": 500
          },
          {
            "id": "extras-cheese",
            "label": "Cheese",
            "price": 700
          },
          {
            "id": "extras-hot",
            "label": "Extra hot",
            "price": 0
          }
        ]
      }
    ]
  },
  {
    "id": "puff-puff",
    "name": "Puff-Puff (10 pieces)",
    "vendorId": "ronkes-snacks",
    "category": "snacks",
    "price": 1500,
    "description": "Soft, golden fried dough balls, lightly sweet. Ten pieces per pack.",
    "prepMinutes": 10,
    "rating": 4.7,
    "ratingCount": 230,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/puff-puff.jpg",
      "alt": "A bowl of puff-puff",
      "credit": {
        "author": "Halima Waziri",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Puff_Puff.jpg"
      }
    },
    "options": []
  },
  {
    "id": "chin-chin",
    "name": "Chin Chin",
    "vendorId": "ronkes-snacks",
    "category": "snacks",
    "price": 1500,
    "description": "Crunchy fried pastry bites with a hint of nutmeg. 250g pack.",
    "prepMinutes": 5,
    "rating": 4.5,
    "ratingCount": 97,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/chin-chin.jpg",
      "alt": "A bowl of chin chin",
      "credit": {
        "author": "ChildofMidnight at English Wikipedia",
        "licence": "CC BY 3.0",
        "url": "https://commons.wikimedia.org/wiki/File:Chin-chin.jpg"
      }
    },
    "options": []
  },
  {
    "id": "dodo",
    "name": "Dodo (Fried Plantain)",
    "vendorId": "ronkes-snacks",
    "category": "snacks",
    "price": 2000,
    "description": "Ripe plantain fried until caramelised at the edges.",
    "prepMinutes": 10,
    "rating": 4.6,
    "ratingCount": 158,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/dodo.jpg",
      "alt": "Fried ripe plantain",
      "credit": {
        "author": "Setor33",
        "licence": "CC0",
        "url": "https://commons.wikimedia.org/wiki/File:Dodo_fried.jpg"
      }
    },
    "options": []
  },
  {
    "id": "chapman",
    "name": "Chapman",
    "vendorId": "ronkes-snacks",
    "category": "drinks",
    "price": 2500,
    "description": "Nigeria's favourite mocktail: fizzy, fruity and bitter-sweet, with cucumber and orange slices.",
    "prepMinutes": 5,
    "rating": 4.6,
    "ratingCount": 134,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/chapman.jpg",
      "alt": "A glass of Chapman with fruit",
      "credit": {
        "author": "secretlondon123",
        "licence": "CC BY-SA 2.0",
        "url": "https://commons.wikimedia.org/wiki/File:Chapman_drink.jpg"
      }
    },
    "options": [
      {
        "id": "size",
        "name": "Size",
        "type": "single",
        "choices": [
          {
            "id": "size-50cl",
            "label": "50cl cup",
            "price": 0
          },
          {
            "id": "size-1l",
            "label": "1 litre bottle",
            "price": 1500
          }
        ]
      }
    ]
  },
  {
    "id": "zobo",
    "name": "Zobo",
    "vendorId": "ronkes-snacks",
    "category": "drinks",
    "price": 1000,
    "description": "Chilled hibiscus drink with ginger, cloves and pineapple.",
    "prepMinutes": 5,
    "rating": 4.7,
    "ratingCount": 176,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/zobo.jpg",
      "alt": "Zobo drink",
      "credit": {
        "author": "Lyndadelz",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Zobo_drink.jpg"
      }
    },
    "options": [
      {
        "id": "size",
        "name": "Size",
        "type": "single",
        "choices": [
          {
            "id": "size-50cl",
            "label": "50cl bottle",
            "price": 0
          },
          {
            "id": "size-1l",
            "label": "1 litre bottle",
            "price": 800
          }
        ]
      }
    ]
  },
  {
    "id": "kunu",
    "name": "Kunu",
    "vendorId": "ronkes-snacks",
    "category": "drinks",
    "price": 1000,
    "description": "Smooth millet drink with ginger and a little spice, served cold.",
    "prepMinutes": 5,
    "rating": 4.4,
    "ratingCount": 88,
    "available": false,
    "bestSeller": false,
    "photo": {
      "src": "/food/kunu.jpg",
      "alt": "Kunu drink in a cup",
      "credit": {
        "author": "Agan56",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Kunu.jpg"
      }
    },
    "options": []
  },
  {
    "id": "fruit-salad",
    "name": "Fruit Salad",
    "vendorId": "ronkes-snacks",
    "category": "desserts",
    "price": 3000,
    "description": "Fresh pineapple, pawpaw, watermelon, banana and apple, cut to order.",
    "prepMinutes": 10,
    "rating": 4.6,
    "ratingCount": 102,
    "available": true,
    "bestSeller": false,
    "photo": {
      "src": "/food/fruit-salad.jpg",
      "alt": "A bowl of fruit salad",
      "credit": {
        "author": "Halima Waziri",
        "licence": "CC BY-SA 4.0",
        "url": "https://commons.wikimedia.org/wiki/File:Fruit_salad_with_ice.jpg"
      }
    },
    "options": [
      {
        "id": "extras",
        "name": "Add extras",
        "type": "multi",
        "choices": [
          {
            "id": "extras-yoghurt",
            "label": "Yoghurt",
            "price": 700
          },
          {
            "id": "extras-ice-cream",
            "label": "Vanilla ice cream",
            "price": 1000
          }
        ]
      }
    ]
  }
];
