"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import interact from "interactjs"
import { RefreshCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Define CSS patterns that don't rely on external images
const cssPatterns = [
  {
    name: "Paper",
    css: `background-color: #f5f5f5;
background-image: linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
linear-gradient(#eee .1em, transparent .1em);
background-size: 100% 1.2em;`,
  },
  {
    name: "Grid Paper",
    css: `background-color: #ffffff;
background-image: linear-gradient(#e3e3e3 1px, transparent 1px),
linear-gradient(90deg, #e3e3e3 1px, transparent 1px);
background-size: 20px 20px;`,
  },
  {
    name: "Lined Paper",
    css: `background-color: #fff;
background-image: linear-gradient(#999 1px, transparent 1px);
background-size: 100% 24px;`,
  },
  {
    name: "Notebook",
    css: `background-color: white;
background-image: linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
linear-gradient(#eee .1em, transparent .1em);
background-size: 100% 1.2em;`,
  },
  {
    name: "Graph Paper",
    css: `background-color: #fff;
background-image: 
  linear-gradient(#ccc 1px, transparent 1px),
  linear-gradient(90deg, #ccc 1px, transparent 1px),
  linear-gradient(#eee 1px, transparent 1px),
  linear-gradient(90deg, #eee 1px, transparent 1px);
background-size: 25px 25px, 25px 25px, 5px 5px, 5px 5px;
background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;`,
  },
  {
    name: "Dots",
    css: `background-color: #ffffff;
background-image: radial-gradient(#000000 1px, transparent 1px);
background-size: 20px 20px;`,
  },
  {
    name: "Crosshatch",
    css: `background-color: #ffffff;
background-image: repeating-linear-gradient(45deg, #e0e0e0 0, #e0e0e0 1px, #ffffff 0, #ffffff 50%);
background-size: 10px 10px;`,
  },
  {
    name: "Blueprint",
    css: `background-color: #269;
background-image: linear-gradient(white 1px, transparent 1px),
linear-gradient(90deg, white 1px, transparent 1px),
linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px);
background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;`,
  },
  {
    name: "Stripes",
    css: `background-color: white;
background-image: repeating-linear-gradient(
  -45deg,
  #f0f0f0,
  #f0f0f0 10px,
  white 10px,
  white 20px
);`,
  },
  {
    name: "Checkerboard",
    css: `background-color: #ffffff;
background-image: linear-gradient(45deg, #efefef 25%, transparent 25%, transparent 75%, #efefef 75%, #efefef), 
linear-gradient(45deg, #efefef 25%, transparent 25%, transparent 75%, #efefef 75%, #efefef);
background-size: 40px 40px;
background-position: 0 0, 20px 20px;`,
  },
  {
    name: "Vintage Paper",
    css: `background-color: #f9f2e7;
background-image: 
  radial-gradient(circle at 100% 150%, #f9f2e7 24%, #f3e9d6 24%, #f3e9d6 28%, #f9f2e7 28%, #f9f2e7 36%, #f3e9d6 36%, #f3e9d6 40%, transparent 40%, transparent),
  radial-gradient(circle at 0 150%, #f9f2e7 24%, #f3e9d6 24%, #f3e9d6 28%, #f9f2e7 28%, #f9f2e7 36%, #f3e9d6 36%, #f3e9d6 40%, transparent 40%, transparent),
  radial-gradient(circle at 50% 100%, #f3e9d6 10%, #f9f2e7 10%, #f9f2e7 23%, #f3e9d6 23%, #f3e9d6 30%, #f9f2e7 30%, #f9f2e7 43%, #f3e9d6 43%, #f3e9d6 50%, #f9f2e7 50%, #f9f2e7 63%, #f3e9d6 63%, #f3e9d6 71%, transparent 71%, transparent),
  radial-gradient(circle at 100% 50%, #f3e9d6 5%, #f9f2e7 5%, #f9f2e7 15%, #f3e9d6 15%, #f3e9d6 20%, #f9f2e7 20%, #f9f2e7 29%, #f3e9d6 29%, #f3e9d6 34%, #f9f2e7 34%, #f9f2e7 44%, #f3e9d6 44%, #f3e9d6 49%, transparent 49%, transparent),
  radial-gradient(circle at 0 50%, #f3e9d6 5%, #f9f2e7 5%, #f9f2e7 15%, #f3e9d6 15%, #f3e9d6 20%, #f9f2e7 20%, #f9f2e7 29%, #f3e9d6 29%, #f3e9d6 34%, #f9f2e7 34%, #f9f2e7 44%, #f3e9d6 44%, #f3e9d6 49%, transparent 49%, transparent);
background-size: 100px 50px;`,
  },
  {
    name: "Cork",
    css: `background-color: #f8f4e9;
background-image: 
  radial-gradient(circle at 50% 50%, rgba(153, 102, 51, 0.1) 0%, rgba(153, 102, 51, 0) 60%),
  radial-gradient(circle at 70% 30%, rgba(153, 102, 51, 0.15) 0%, rgba(153, 102, 51, 0) 45%),
  radial-gradient(circle at 30% 70%, rgba(153, 102, 51, 0.15) 0%, rgba(153, 102, 51, 0) 45%),
  radial-gradient(circle at 20% 20%, rgba(153, 102, 51, 0.1) 0%, rgba(153, 102, 51, 0) 50%);
background-size: 200px 200px;
background-position: 0 0, 0 0, 0 0, 0 0;`,
  },
]

// Additional CSS patterns for refresh functionality
const additionalCssPatterns = [
  {
    name: "Diagonal Lines",
    css: `background-color: #ffffff;
background-image: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 2px, #ffffff 2px, #ffffff 10px);`,
  },
  {
    name: "Zigzag",
    css: `background-color: #ffffff;
background-image: linear-gradient(135deg, #f0f0f0 25%, transparent 25%), 
linear-gradient(225deg, #f0f0f0 25%, transparent 25%), 
linear-gradient(315deg, #f0f0f0 25%, transparent 25%), 
linear-gradient(45deg, #f0f0f0 25%, transparent 25%);
background-size: 20px 20px;
background-position: 0 0, 10px 0, 10px -10px, 0px 10px;`,
  },
  {
    name: "Herringbone",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(45deg, #f0f0f0 12%, transparent 0, transparent 88%, #f0f0f0 0),
  linear-gradient(135deg, #f0f0f0 12%, transparent 0, transparent 88%, #f0f0f0 0);
background-size: 40px 40px;`,
  },
  {
    name: "Carbon Fiber",
    css: `background-color: #1a1a1a;
background-image: 
  linear-gradient(45deg, rgba(0, 0, 0, 0.2) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.2) 75%, rgba(0, 0, 0, 0.2)), 
  linear-gradient(-45deg, rgba(0, 0, 0, 0.2) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.2) 75%, rgba(0, 0, 0, 0.2));
background-size: 10px 10px;`,
  },
  {
    name: "Polka Dots",
    css: `background-color: #ffffff;
background-image: radial-gradient(#e0e0e0 2px, transparent 2px);
background-size: 15px 15px;`,
  },
  {
    name: "Tartan",
    css: `background-color: #f5f5f5;
background-image: 
  repeating-linear-gradient(transparent, transparent 50px, rgba(0,0,0,.05) 50px, rgba(0,0,0,.05) 53px, transparent 53px, transparent 63px, rgba(0,0,0,.05) 63px, rgba(0,0,0,.05) 66px, transparent 66px, transparent 116px, rgba(0,0,0,.05) 116px, rgba(0,0,0,.05) 166px, rgba(255,255,255,.2) 166px, rgba(255,255,255,.2) 169px, rgba(0,0,0,.05) 169px, rgba(0,0,0,.05) 179px, rgba(255,255,255,.2) 179px, rgba(255,255,255,.2) 182px, rgba(0,0,0,.05) 182px, rgba(0,0,0,.05) 232px, transparent 232px),
  repeating-linear-gradient(270deg, transparent, transparent 50px, rgba(0,0,0,.05) 50px, rgba(0,0,0,.05) 53px, transparent 53px, transparent 63px, rgba(0,0,0,.05) 63px, rgba(0,0,0,.05) 66px, transparent 66px, transparent 116px, rgba(0,0,0,.05) 116px, rgba(0,0,0,.05) 166px, rgba(255,255,255,.2) 166px, rgba(255,255,255,.2) 169px, rgba(0,0,0,.05) 169px, rgba(0,0,0,.05) 179px, rgba(255,255,255,.2) 179px, rgba(255,255,255,.2) 182px, rgba(0,0,0,.05) 182px, rgba(0,0,0,.05) 232px, transparent 232px),
  repeating-linear-gradient(125deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 3px, transparent 3px, transparent 5px, rgba(0,0,0,.05) 5px);`,
  },
  {
    name: "Waves",
    css: `background-color: #ffffff;
background-image: 
  radial-gradient(circle at 100% 50%, transparent 20%, rgba(0,0,0,0.03) 21%, rgba(0,0,0,0.03) 34%, transparent 35%, transparent),
  radial-gradient(circle at 0% 50%, transparent 20%, rgba(0,0,0,0.03) 21%, rgba(0,0,0,0.03) 34%, transparent 35%, transparent);
background-size: 60px 120px;`,
  },
  {
    name: "Honeycomb",
    css: `background-color: #ffffff;
background-image: 
  radial-gradient(circle farthest-side at 0% 50%, #f0f0f0 23.5%, rgba(240, 240, 240, 0) 0)21px 30px,
  radial-gradient(circle farthest-side at 0% 50%, #e0e0e0 24%, rgba(240, 240, 240, 0) 0)19px 30px,
  linear-gradient(#f0f0f0 14%, rgba(240, 240, 240, 0) 0, rgba(240, 240, 240, 0) 85%, #f0f0f0 0)0 0,
  linear-gradient(150deg, #f0f0f0 24%, #e0e0e0 0, #e0e0e0 26%, rgba(240, 240, 240, 0) 0, rgba(240, 240, 240, 0) 74%, #e0e0e0 0, #e0e0e0 76%, #f0f0f0 0)0 0,
  linear-gradient(30deg, #f0f0f0 24%, #e0e0e0 0, #e0e0e0 26%, rgba(240, 240, 240, 0) 0, rgba(240, 240, 240, 0) 74%, #e0e0e0 0, #e0e0e0 76%, #f0f0f0 0)0 0,
  linear-gradient(90deg, #e0e0e0 2%, #f0f0f0 0, #f0f0f0 98%, #e0e0e0 0%)0 0 #f0f0f0;
background-size: 40px 60px;`,
  },
  {
    name: "Japanese Pattern",
    css: `background-color: #ffffff;
background-image: 
  radial-gradient(circle at 0% 50%, rgba(96, 16, 48, 0) 9px, #e0e0e0 10px, rgba(96, 16, 48, 0) 11px) 0px 10px,
  radial-gradient(at 100% 100%, rgba(96, 16, 48, 0) 9px, #e0e0e0 10px, rgba(96, 16, 48, 0) 11px);
background-size: 20px 20px;`,
  },
  {
    name: "Argyle",
    css: `background-color: #ffffff;
background-image: 
  repeating-linear-gradient(120deg, rgba(0,0,0,.1), rgba(0,0,0,.1) 1px, transparent 1px, transparent 60px),
  repeating-linear-gradient(60deg, rgba(0,0,0,.1), rgba(0,0,0,.1) 1px, transparent 1px, transparent 60px),
  linear-gradient(60deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1)),
  linear-gradient(120deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1));
background-size: 70px 120px;`,
  },
  {
    name: "Weave",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
background-size: 60px 60px;
background-position: 0 0, 30px 30px;`,
  },
  {
    name: "Houndstooth",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
background-size: 10px 10px;
background-position: 0 0, 5px 5px;`,
  },
]

// More CSS patterns for additional refreshes
const moreCssPatterns = [
  {
    name: "Seigaiha",
    css: `background-color: #f5f5f5;
background-image: 
  radial-gradient(circle at 100% 150%, #f5f5f5 24%, #e0e0e0 25%, #e0e0e0 28%, #f5f5f5 29%, #f5f5f5 36%, #e0e0e0 36%, #e0e0e0 40%, transparent 40%, transparent),
  radial-gradient(circle at 0 150%, #f5f5f5 24%, #e0e0e0 25%, #e0e0e0 28%, #f5f5f5 29%, #f5f5f5 36%, #e0e0e0 36%, #e0e0e0 40%, transparent 40%, transparent),
  radial-gradient(circle at 50% 100%, #e0e0e0 10%, #f5f5f5 11%, #f5f5f5 23%, #e0e0e0 24%, #e0e0e0 30%, #f5f5f5 31%, #f5f5f5 43%, #e0e0e0 44%, #e0e0e0 50%, #f5f5f5 51%, #f5f5f5 63%, #e0e0e0 64%, #e0e0e0 71%, transparent 71%, transparent),
  radial-gradient(circle at 100% 50%, #e0e0e0 5%, #f5f5f5 6%, #f5f5f5 15%, #e0e0e0 16%, #e0e0e0 20%, #f5f5f5 21%, #f5f5f5 30%, #e0e0e0 31%, #e0e0e0 35%, #f5f5f5 36%, #f5f5f5 45%, #e0e0e0 46%, #e0e0e0 49%, transparent 50%, transparent),
  radial-gradient(circle at 0 50%, #e0e0e0 5%, #f5f5f5 6%, #f5f5f5 15%, #e0e0e0 16%, #e0e0e0 20%, #f5f5f5 21%, #f5f5f5 30%, #e0e0e0 31%, #e0e0e0 35%, #f5f5f5 36%, #f5f5f5 45%, #e0e0e0 46%, #e0e0e0 49%, transparent 50%, transparent);
background-size: 100px 50px;`,
  },
  {
    name: "Subtle Stripes",
    css: `background-color: #ffffff;
background-image: linear-gradient(90deg, rgba(0,0,0,0.03) 50%, transparent 50%);
background-size: 4px 4px;`,
  },
  {
    name: "Diagonal Stripes",
    css: `background-color: #ffffff;
background-image: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 5px, #ffffff 5px, #ffffff 10px);`,
  },
  {
    name: "Crosshatch Fine",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(#f0f0f0 1px, transparent 1px),
  linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
background-size: 10px 10px;`,
  },
  {
    name: "Brick Wall",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(335deg, #e0e0e0 23px, transparent 23px),
  linear-gradient(155deg, #e0e0e0 23px, transparent 23px),
  linear-gradient(335deg, #e0e0e0 23px, transparent 23px),
  linear-gradient(155deg, #e0e0e0 23px, transparent 23px);
background-size: 58px 58px;
background-position: 0px 2px, 4px 35px, 29px 31px, 34px 6px;`,
  },
  {
    name: "Moroccan",
    css: `background-color: #ffffff;
background-image: 
  radial-gradient(circle at 0% 50%, rgba(96, 16, 48, 0) 9px, #f0f0f0 10px, rgba(96, 16, 48, 0) 11px) 0px 10px,
  radial-gradient(at 100% 100%, rgba(96, 16, 48, 0) 9px, #f0f0f0 10px, rgba(96, 16, 48, 0) 11px),
  radial-gradient(at 0% 0%, rgba(96, 16, 48, 0) 9px, #f0f0f0 10px, rgba(96, 16, 48, 0) 11px),
  radial-gradient(at 100% 0%, rgba(96, 16, 48, 0) 9px, #f0f0f0 10px, rgba(96, 16, 48, 0) 11px);
background-size: 20px 20px;`,
  },
  {
    name: "Subtle Dots",
    css: `background-color: #ffffff;
background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
background-size: 16px 16px;`,
  },
  {
    name: "Diagonal Grid",
    css: `background-color: #ffffff;
background-image: 
  repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 1px, #ffffff 1px, #ffffff 10px);`,
  },
  {
    name: "Isometric Grid",
    css: `background-color: #ffffff;
background-image: 
  linear-gradient(30deg, #f0f0f0 12%, transparent 12.5%, transparent 87.5%, #f0f0f0 87.5%, #f0f0f0),
  linear-gradient(150deg, #f0f0f0 12%, transparent 12.5%, transparent 87.5%, #f0f0f0 87.5%, #f0f0f0),
  linear-gradient(30deg, #f0f0f0 12%, transparent 12.5%, transparent 87.5%, #f0f0f0 87.5%, #f0f0f0),
  linear-gradient(150deg, #f0f0f0 12%, transparent 12.5%, transparent 87.5%, #f0f0f0 87.5%, #f0f0f0),
  linear-gradient(60deg, #f0f0f080 25%, transparent 25.5%, transparent 75%, #f0f0f080 75%, #f0f0f080),
  linear-gradient(60deg, #f0f0f080 25%, transparent 25.5%, transparent 75%, #f0f0f080 75%, #f0f0f080);
background-size: 40px 70px;
background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;`,
  },
  {
    name: "Lined Paper Dark",
    css: `background-color: #f5f5f5;
background-image: 
  linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
  linear-gradient(#eee .1em, transparent .1em);
background-size: 100% 1.2em;`,
  },
  {
    name: "Squared Paper",
    css: `background-color: #fff;
background-image: 
  linear-gradient(90deg, rgba(200,0,0,.5) 50%, transparent 50%),
  linear-gradient(rgba(200,0,0,.5) 50%, transparent 50%);
background-size: 50px 50px;`,
  },
  {
    name: "Wavy Lines",
    css: `background-color: #ffffff;
background-image: 
  repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 2px, #ffffff 2px, #ffffff 8px),
  repeating-linear-gradient(135deg, #f0f0f0, #f0f0f0 2px, #ffffff 2px, #ffffff 8px);`,
  },
]

// Unsplash background images (using public URLs)
const unsplashBackgrounds = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=600&auto=format&fit=crop",
    author: "Annie Spratt",
    description: "Green leaves pattern",
  },
]

// Add more sets of Unsplash images for refreshing
const unsplashBackgroundsSet2 = [
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
    author: "Sean O.",
    description: "Beach sand texture",
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1519972064555-542444e71b54?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract paint",
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1579187707643-35646d22b596?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Blue and white paint",
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract background",
  },
]

const unsplashBackgroundsSet3 = [
  {
    id: "13",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract paint",
  },
  {
    id: "14",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract texture",
  },
  {
    id: "15",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract paint",
  },
  {
    id: "16",
    url: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract paint",
  },
  {
    id: "18",
    url: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=600&auto=format&fit=crop",
    author: "Paweł Czerwiński",
    description: "Abstract paint",
  },
]

// Additional Unsplash image sets for more variety
const unsplashBackgroundsSet4 = [
  {
    id: "19",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop",
    author: "Danica Tanjutco",
    description: "Abstract texture",
  },
  {
    id: "20",
    url: "https://images.unsplash.com/photo-1550537687-c91072c4792d?w=600&auto=format&fit=crop",
    author: "Daniel Öberg",
    description: "Blue water texture",
  },
  {
    id: "21",
    url: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Colorful abstract paint",
  },
  {
    id: "23",
    url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Abstract liquid texture",
  },
]

const unsplashBackgroundsSet5 = [
  {
    id: "26",
    url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Blue abstract paint",
  },
  {
    id: "27",
    url: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Wavy abstract texture",
  },
  {
    id: "28",
    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Flowing abstract paint",
  },
  {
    id: "30",
    url: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=600&auto=format&fit=crop",
    author: "Pawel Czerwinski",
    description: "Abstract paint texture",
  },
]

// Now update the DraggableBackgroundSelector component to include the new props:
function DraggableBackgroundSelector({
  onClose,
  onBackgroundSelect,
  customImageUrl,
  onCustomImageUrlChange,
  onApplyCustomImage,
  backgrounds,
  onRefresh,
  isRefreshing,
  unsplashImages,
  onUnsplashRefresh,
  isUnsplashRefreshing,
}: {
  onClose: () => void
  onBackgroundSelect: (background: string) => void
  customImageUrl: string
  onCustomImageUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyCustomImage: () => void
  backgrounds: Array<{ name: string; css: string }>
  onRefresh: () => void
  isRefreshing: boolean
  unsplashImages: Array<{ id: string; url: string; author: string; description: string }>
  onUnsplashRefresh: () => void
  isUnsplashRefreshing: boolean
}) {
  // Keep existing code and update the return statement to include the new tab:
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(() => {
    // Calculate initial position - place it at the right side of the screen
    const initialX = typeof window !== "undefined" ? Math.max(window.innerWidth - 450, 10) : 10
    const initialY = 100
    return { x: initialX, y: initialY }
  })

  useEffect(() => {
    // Only initialize interact when the dialog is mounted and ref is available
    if (!dialogRef.current) return

    const element = dialogRef.current

    const interactable = interact(element).draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "body",
          endOnly: true,
        }),
      ],
      // enable autoScroll
      autoScroll: true,

      listeners: {
        // call this function on every dragmove event
        move: (event) => {
          setPosition((prev) => ({
            x: prev.x + event.dx,
            y: prev.y + event.dy,
          }))
        },
        start: () => {
          setIsDragging(true)
        },
        end: () => {
          setIsDragging(false)
        },
      },
    })

    // Clean up function
    return () => {
      if (interactable) {
        interactable.unset()
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={`absolute bg-background border rounded-lg shadow-lg overflow-hidden w-[400px] ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="p-4 border-b cursor-move flex justify-between items-center"
          onMouseDown={(e) => e.preventDefault()}
        >
          <h3 className="font-semibold">Choose Background</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <Tabs defaultValue="predefined">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predefined">Patterns</TabsTrigger>
              <TabsTrigger value="unsplash">Photos</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="predefined">
              <div className="flex justify-between mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onBackgroundSelect("none")
                    onClose()
                  }}
                  className="flex items-center gap-1"
                >
                  No Background
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {backgrounds
                  .filter((bg) => bg.name !== "None")
                  .map((bg) => (
                    <button
                      key={bg.name}
                      className="w-20 h-20 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
                      onClick={() => {
                        onBackgroundSelect(bg.css)
                        onClose()
                      }}
                      title={bg.name}
                      style={{ background: bg.css }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                        {bg.name}
                      </div>
                    </button>
                  ))}
              </div>
            </TabsContent>

            {/* New Unsplash tab */}
            <TabsContent value="unsplash">
              <div className="flex justify-between mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onBackgroundSelect("none")
                    onClose()
                  }}
                  className="flex items-center gap-1"
                >
                  No Background
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUnsplashRefresh}
                  disabled={isUnsplashRefreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${isUnsplashRefreshing ? "animate-spin" : ""}`} />
                  <span>New Photos</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {isUnsplashRefreshing
                  ? // Show skeletons while loading
                    Array(6)
                      .fill(0)
                      .map((_, i) => <Skeleton key={i} className="w-full h-32 rounded-md" />)
                  : unsplashImages.map((img) => (
                      <button
                        key={img.id}
                        className="w-full h-32 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden"
                        onClick={() => {
                          onBackgroundSelect(`url(${img.url})`)
                          onClose()
                        }}
                        title={`${img.description} by ${img.author}`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${img.url})` }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1 text-center">
                          <span className="line-clamp-1">{img.description}</span>
                          <span className="text-xs opacity-75">by {img.author}</span>
                        </div>
                      </button>
                    ))}
              </div>
              <div className="mt-2 text-xs text-center text-muted-foreground">Photos from Unsplash</div>
            </TabsContent>

            <TabsContent value="custom">
              <div className="grid gap-4 py-4">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="Enter image URL"
                  value={customImageUrl}
                  onChange={onCustomImageUrlChange}
                />
                <Button onClick={onApplyCustomImage}>Apply</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Now update the BackgroundUploader component to include the new state and functions:

interface BackgroundUploaderProps {
  onBackgroundChange: (background: string) => void
}

export function BackgroundUploader({ onBackgroundChange }: BackgroundUploaderProps) {
  const [open, setOpen] = useState(false)
  const [customImageUrl, setCustomImageUrl] = useState("")
  const [currentBackgrounds, setCurrentBackgrounds] = useState([
    { name: "None", css: "none" },
    {
      name: "Paper",
      css: '#f5f5f5 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f5f5f5"/><line x1="0" y1="20" x2="100" y2="20" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="40" x2="100" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="60" x2="100" y2="60" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="80" x2="100" y2="80" stroke="%23e0e0e0" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Grid",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><line x1="0" y1="0" x2="0" y2="20" stroke="%23e3e3e3" strokeWidth="1"/><line x1="0" y1="0" x2="20" y2="0" stroke="%23e3e3e3" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Dots",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><circle cx="10" cy="10" r="1" fill="%23000000"/></svg>\')',
    },
    {
      name: "Lined Paper",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="24"><rect width="100" height="24" fill="%23ffffff"/><line x1="0" y1="23" x2="100" y2="23" stroke="%23999999" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Checkerboard",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ffffff"/><rect width="20" height="20" fill="%23efefef"/><rect x="20" y="20" width="20" height="20" fill="%23efefef"/></svg>\')',
    },
    {
      name: "Stripes",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><rect width="10" height="20" fill="%23f8f8f8"/></svg>\')',
    },
    { name: "Vintage Paper", css: "#f9f2e7" },
    {
      name: "Concrete",
      css: '#f5f5f5 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f5f5f5"/><circle cx="10" cy="10" r="1" fill="%23e0e0e0"/><circle cx="30" cy="40" r="2" fill="%23e0e0e0"/><circle cx="70" cy="20" r="1.5" fill="%23e0e0e0"/><circle cx="90" cy="60" r="1" fill="%23e0e0e0"/><circle cx="50" cy="80" r="2" fill="%23e0e0e0"/></svg>\')',
    },
    {
      name: "Graph Paper",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ffffff"/><line x1="0" y1="0" x2="40" y2="0" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="10" x2="40" y2="10" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="20" x2="40" y2="20" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="30" x2="40" y2="30" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="40" x2="40" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="0" x2="0" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="10" y1="0" x2="10" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="20" y1="0" x2="20" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="30" y1="0" x2="30" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="40" y1="0" x2="40" y2="40" stroke="%23e0e0e0" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Notebook",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ffffff"/><line x1="0" y1="0" x2="0" y2="100" stroke="%23abced4" strokeWidth="2" strokeDasharray="5,5"/><line x1="0" y1="20" x2="100" y2="20" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="40" x2="100" y2="40" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="60" x2="100" y2="60" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="80" x2="100" y2="80" stroke="%23eeeeee" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Crosshatch",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><path d="M0,0 L10,10 M10,0 L0,10" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
    },
    {
      name: "Subtle Dots",
      css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23ffffff"/><circle cx="8" cy="8" r="1" fill="%23e0e0e0"/></svg>\')',
    },
  ])

  // Add new state for Unsplash images
  const [currentUnsplashImages, setCurrentUnsplashImages] = useState(() => {
    // Combine images from different sets to get an initial set of 6 images
    const allImages = [
      ...unsplashBackgrounds,
      ...unsplashBackgroundsSet2,
      ...unsplashBackgroundsSet3,
      ...unsplashBackgroundsSet4,
      ...unsplashBackgroundsSet5,
    ]

    // Fisher-Yates shuffle algorithm to randomize the images
    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Shuffle all images and take the first 6
    return shuffleArray(allImages).slice(0, 6)
  })
  const [unsplashRefreshCount, setUnsplashRefreshCount] = useState(0)
  const [isUnsplashRefreshing, setIsUnsplashRefreshing] = useState(false)

  const [refreshCount, setRefreshCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Handle window resize to ensure the dialog stays within viewport
    const handleResize = () => {
      if (open) {
        // If the window is resized while the dialog is open, adjust position if needed
        const maxX = window.innerWidth - 450 // 450px accounts for dialog width + margin
        const maxY = window.innerHeight - 100 // Keep it within vertical bounds too

        // This will update the position in the DraggableBackgroundSelector when it's rendered
        setCustomImageUrl((prev) => prev) // Trigger a re-render
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [open])

  const handleBackgroundSelect = (background: string) => {
    onBackgroundChange(background)
  }

  const handleCustomImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomImageUrl(e.target.value)
  }

  const handleApplyCustomImage = () => {
    if (customImageUrl) {
      // For custom URLs, we'll pass the URL directly
      onBackgroundChange(`url(${customImageUrl})`)
      setOpen(false)
    }
  }

  // Keep the existing handleRefresh function and add a new one for Unsplash:

  const handleUnsplashRefresh = () => {
    setIsUnsplashRefreshing(true)

    // Simulate loading delay
    setTimeout(() => {
      // Instead of just cycling through 3 fixed sets, let's create more variety
      // by shuffling and combining images from different sets
      const allImages = [
        ...unsplashBackgrounds,
        ...unsplashBackgroundsSet2,
        ...unsplashBackgroundsSet3,
        ...unsplashBackgroundsSet4,
        ...unsplashBackgroundsSet5,
      ]

      // Fisher-Yates shuffle algorithm to randomize the images
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[array[i], array[j]] = [array[j], array[i]]
        }
        return array
      }

      // Shuffle all images
      const shuffledImages = shuffleArray([...allImages])

      // Take 6 random images from the shuffled array
      const randomImages = shuffledImages.slice(0, 6)

      // Update the current images
      setCurrentUnsplashImages(randomImages)

      // Increment the refresh count to track how many times we've refreshed
      setUnsplashRefreshCount((prev) => prev + 1)
      setIsUnsplashRefreshing(false)
    }, 800)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate loading delay
    setTimeout(() => {
      // Cycle through different background sets
      if (refreshCount === 0) {
        setCurrentBackgrounds([
          { name: "None", css: "none" },
          {
            name: "Checkerboard",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ffffff"/><rect width="20" height="20" fill="%23efefef"/><rect x="20" y="20" width="20" height="20" fill="%23efefef"/></svg>\')',
          },
          {
            name: "Stripes",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><rect width="10" height="20" fill="%23f8f8f8"/></svg>\')',
          },
          {
            name: "Polka Dots",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"><rect width="15" height="15" fill="%23ffffff"/><circle cx="7.5" cy="7.5" r="2" fill="%23e0e0e0"/></svg>\')',
          },
          {
            name: "Crosshatch",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><path d="M0,0 L10,10 M10,0 L0,10" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Blueprint",
            css: '#269 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23269"/><line x1="0" y1="0" x2="100" y2="0" stroke="white" strokeWidth="1"/><line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeWidth="1"/><line x1="0" y1="0" x2="0" y2="100" stroke="white" strokeWidth="1"/><line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="40" y1="0" x2="40" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="60" y1="0" x2="60" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/><line x1="100" y1="0" x2="100" y2="100" stroke="white" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Argyle",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="120"><rect width="70" height="120" fill="%23ffffff"/><path d="M0,0 L70,120 M70,0 L0,120" stroke="%23f0f0f0" strokeWidth="1"/><path d="M0,60 L35,0 M35,120 L70,60" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Weave",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23ffffff"/><rect width="30" height="30" fill="%23f0f0f0"/><rect x="30" y="30" width="30" height="30" fill="%23f0f0f0"/></svg>\')',
          },
          { name: "Parchment", css: "#f5f2e9" },
          { name: "Cream Paper", css: "#fffef0" },
          { name: "Light Gray", css: "#f8f8f8" },
        ])
      } else if (refreshCount === 1) {
        setCurrentBackgrounds([
          { name: "None", css: "none" },
          {
            name: "Subtle Stripes",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="%23ffffff"/><rect width="2" height="4" fill="%23fafafa"/></svg>\')',
          },
          {
            name: "Diagonal Stripes",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><path d="M-1,1 L11,13 M-1,-9 L11,3 M-1,11 L11,23" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Crosshatch Fine",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><line x1="0" y1="0" x2="10" y2="0" stroke="%23f0f0f0" strokeWidth="1"/><line x1="0" y1="0" x2="0" y2="10" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Brick Wall",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="58" height="58"><rect width="58" height="58" fill="%23ffffff"/><path d="M0,0 L29,0 L29,29 L0,29 Z" fill="%23f8f8f8"/><path d="M29,29 L58,29 L58,58 L29,58 Z" fill="%23f8f8f8"/></svg>\')',
          },
          {
            name: "Moroccan",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><circle cx="0" cy="10" r="10" fill="%23f8f8f8"/><circle cx="20" cy="10" r="10" fill="%23f8f8f8"/><circle cx="10" cy="0" r="10" fill="%23f8f8f8"/><circle cx="10" cy="20" r="10" fill="%23f8f8f8"/></svg>\')',
          },
          {
            name: "Subtle Dots",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23ffffff"/><circle cx="8" cy="8" r="1" fill="%23e0e0e0"/></svg>\')',
          },
          {
            name: "Diagonal Grid",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><path d="M0,10 L10,0" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Isometric Grid",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="70"><rect width="40" height="70" fill="%23ffffff"/><path d="M0,0 L20,35 L40,0 Z" fill="%23f8f8f8"/><path d="M0,70 L20,35 L40,70 Z" fill="%23f8f8f8"/></svg>\')',
          },
          {
            name: "Lined Paper Dark",
            css: '#f5f5f5 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="24"><rect width="100" height="24" fill="%23f5f5f5"/><line x1="0" y1="23" x2="100" y2="23" stroke="%23abced4" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Wavy Lines",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><path d="M0,10 Q5,5 10,10 T20,10" stroke="%23f0f0f0" strokeWidth="1" fill="none"/><path d="M0,15 Q5,10 10,15 T20,15" stroke="%23f0f0f0" strokeWidth="1" fill="none"/><path d="M0,5 Q5,0 10,5 T20,5" stroke="%23f0f0f0" strokeWidth="1" fill="none"/></svg>\')',
          },
        ])
      } else {
        // Mix backgrounds from all sets for more variety
        setCurrentBackgrounds([
          { name: "None", css: "none" },
          {
            name: "Paper",
            css: '#f5f5f5 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f5f5f5"/><line x1="0" y1="20" x2="100" y2="20" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="40" x2="100" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="60" x2="100" y2="60" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="80" x2="100" y2="80" stroke="%23e0e0e0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Grid",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><line x1="0" y1="0" x2="0" y2="20" stroke="%23e3e3e3" strokeWidth="1"/><line x1="0" y1="0" x2="20" y2="0" stroke="%23e3e3e3" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Dots",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><circle cx="10" cy="10" r="1" fill="%23000000"/></svg>\')',
          },
          {
            name: "Checkerboard",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ffffff"/><rect width="20" height="20" fill="%23efefef"/><rect x="20" y="20" width="20" height="20" fill="%23efefef"/></svg>\')',
          },
          {
            name: "Stripes",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="%23ffffff"/><rect width="10" height="20" fill="%23f8f8f8"/></svg>\')',
          },
          { name: "Vintage Paper", css: "#f9f2e7" },
          {
            name: "Concrete",
            css: '#f5f5f5 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f5f5f5"/><circle cx="10" cy="10" r="1" fill="%23e0e0e0"/><circle cx="30" cy="40" r="2" fill="%23e0e0e0"/><circle cx="70" cy="20" r="1.5" fill="%23e0e0e0"/><circle cx="90" cy="60" r="1" fill="%23e0e0e0"/><circle cx="50" cy="80" r="2" fill="%23e0e0e0"/></svg>\')',
          },
          {
            name: "Graph Paper",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ffffff"/><line x1="0" y1="0" x2="40" y2="0" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="10" x2="40" y2="10" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="20" x2="40" y2="20" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="30" x2="40" y2="30" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="40" x2="40" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="0" y1="0" x2="0" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="10" y1="0" x2="10" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="20" y1="0" x2="20" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="30" y1="0" x2="30" y2="40" stroke="%23e0e0e0" strokeWidth="1"/><line x1="40" y1="0" x2="40" y2="40" stroke="%23e0e0e0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Notebook",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ffffff"/><line x1="0" y1="0" x2="0" y2="100" stroke="%23abced4" strokeWidth="2" strokeDasharray="5,5"/><line x1="0" y1="20" x2="100" y2="20" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="40" x2="100" y2="40" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="60" x2="100" y2="60" stroke="%23eeeeee" strokeWidth="1"/><line x1="0" y1="80" x2="100" y2="80" stroke="%23eeeeee" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Crosshatch",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="%23ffffff"/><path d="M0,0 L10,10 M10,0 L0,10" stroke="%23f0f0f0" strokeWidth="1"/></svg>\')',
          },
          {
            name: "Subtle Dots",
            css: '#ffffff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23ffffff"/><circle cx="8" cy="8" r="1" fill="%23e0e0e0"/></svg>\')',
          },
        ])
        setRefreshCount(-1) // Will become 0 after increment
      }

      setRefreshCount((prev) => prev + 1)
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)} title="Background">
        <ImageIcon className="h-4 w-4" />
      </Button>

      {open && (
        <DraggableBackgroundSelector
          onClose={() => setOpen(false)}
          onBackgroundSelect={handleBackgroundSelect}
          customImageUrl={customImageUrl}
          onCustomImageUrlChange={handleCustomImageUrlChange}
          onApplyCustomImage={handleApplyCustomImage}
          backgrounds={currentBackgrounds}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          unsplashImages={currentUnsplashImages}
          onUnsplashRefresh={handleUnsplashRefresh}
          isUnsplashRefreshing={isUnsplashRefreshing}
        />
      )}
    </>
  )
}

