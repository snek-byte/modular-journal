"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, Image, Info } from "lucide-react"
import * as React from "react"

// Import icons from react-icons
import {
  FaStar,
  FaHeart,
  FaCircle,
  FaSquare,
  FaCheckCircle,
  FaCheckSquare,
  FaHome,
  FaShoppingCart,
  FaPhone,
  FaCamera,
  FaMusic,
  FaVideo,
  FaBook,
  FaCar,
  FaUser,
  FaUsers,
  FaEnvelope,
  FaCalendar,
  FaClock,
  FaBell,
  FaFile,
  FaFolder,
  FaSave,
  FaTrash,
  FaEdit,
  FaComment,
  FaThumbsUp,
  FaSearch,
  FaDesktop,
  FaCloud,
  FaSun,
  FaMoon,
  FaCloudRain,
  FaSnowflake,
  FaWind,
  FaUmbrella,
  FaThermometerHalf,
  FaBolt,
  FaPlane,
  FaTrain,
  FaBus,
  FaBicycle,
  FaShip,
  FaWalking,
  FaRunning,
  FaSwimmer,
  FaHiking,
  FaFutbol,
  FaBasketballBall,
  FaBaseballBall,
  FaFootballBall,
  FaGolfBall,
  FaTableTennis,
  FaVolleyballBall,
  FaApple,
  FaPizzaSlice,
  FaHamburger,
  FaIceCream,
  FaCoffee,
  FaBeer,
  FaWineGlass,
  FaCocktail,
  FaUtensils,
  FaStore,
  FaShoppingBag,
  FaCreditCard,
  FaMoneyBillWave,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCode,
  FaDatabase,
  FaServer,
  FaWifi,
  FaBluetooth,
  FaBatteryFull,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
  FaTelegram,
  FaSnapchat,
  FaPinterest,
  FaReddit,
  FaTwitch,
  FaDiscord,
  FaGithub,
  FaGitlab,
} from "react-icons/fa"

import {
  FiStar,
  FiHeart,
  FiCircle,
  FiSquare,
  FiCheckCircle,
  FiCheckSquare,
  FiHome,
  FiShoppingCart,
  FiPhone,
  FiCamera,
  FiMusic,
  FiVideo,
  FiBook,
  FiTruck,
  FiCalendar,
  FiClock,
  FiBell,
  FiMail,
  FiUser,
  FiUsers,
  FiFile,
  FiFolder,
  FiSave,
  FiTrash,
  FiEdit,
  FiMessageSquare,
  FiThumbsUp,
  FiSearch,
  FiMonitor,
  FiCloud,
  FiSun,
  FiMoon,
  FiCloudRain,
  FiCloudSnow,
  FiWind,
  FiUmbrella,
  FiThermometer,
  FiZap,
  FiNavigation,
  FiCoffee,
  FiShoppingBag,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiCode,
  FiDatabase,
  FiServer,
  FiWifi,
  FiBluetooth,
  FiBattery,
  FiBatteryCharging,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiGithub,
  FiGitlab,
} from "react-icons/fi"

// Organize icons by categories
const iconCategories = [
  {
    id: "general",
    name: "General",
    icons: [
      { name: "Star", component: FaStar, color: "#FFD700" },
      { name: "Heart", component: FaHeart, color: "#FF6B6B" },
      { name: "Circle", component: FaCircle, color: "#4CAF50" },
      { name: "Square", component: FaSquare, color: "#2196F3" },
      { name: "CheckCircle", component: FaCheckCircle, color: "#4CAF50" },
      { name: "CheckSquare", component: FaCheckSquare, color: "#2196F3" },
      { name: "StarOutline", component: FiStar },
      { name: "HeartOutline", component: FiHeart },
      { name: "CircleOutline", component: FiCircle },
      { name: "SquareOutline", component: FiSquare },
      { name: "CheckCircleOutline", component: FiCheckCircle },
      { name: "CheckSquareOutline", component: FiCheckSquare },
    ],
  },
  {
    id: "home",
    name: "Home & Living",
    icons: [
      { name: "Home", component: FaHome, color: "#795548" },
      { name: "HomeOutline", component: FiHome },
      { name: "ShoppingCart", component: FaShoppingCart, color: "#FF9800" },
      { name: "ShoppingCartOutline", component: FiShoppingCart },
      { name: "ShoppingBag", component: FaShoppingBag, color: "#FF9800" },
      { name: "ShoppingBagOutline", component: FiShoppingBag },
      { name: "Store", component: FaStore, color: "#607D8B" },
      { name: "Utensils", component: FaUtensils, color: "#9E9E9E" },
    ],
  },
  {
    id: "communication",
    name: "Communication",
    icons: [
      { name: "Phone", component: FaPhone, color: "#4CAF50" },
      { name: "PhoneOutline", component: FiPhone },
      { name: "Mail", component: FaEnvelope, color: "#2196F3" },
      { name: "MailOutline", component: FiMail },
      { name: "Comment", component: FaComment, color: "#9C27B0" },
      { name: "CommentOutline", component: FiMessageSquare },
      { name: "ThumbsUp", component: FaThumbsUp, color: "#2196F3" },
      { name: "ThumbsUpOutline", component: FiThumbsUp },
    ],
  },
  {
    id: "media",
    name: "Media",
    icons: [
      { name: "Camera", component: FaCamera, color: "#607D8B" },
      { name: "CameraOutline", component: FiCamera },
      { name: "Music", component: FaMusic, color: "#9C27B0" },
      { name: "MusicOutline", component: FiMusic },
      { name: "Video", component: FaVideo, color: "#E91E63" },
      { name: "VideoOutline", component: FiVideo },
      { name: "Book", component: FaBook, color: "#795548" },
      { name: "BookOutline", component: FiBook },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    icons: [
      { name: "Sun", component: FaSun, color: "#FFC107" },
      { name: "SunOutline", component: FiSun },
      { name: "Moon", component: FaMoon, color: "#673AB7" },
      { name: "MoonOutline", component: FiMoon },
      { name: "Cloud", component: FaCloud, color: "#90A4AE" },
      { name: "CloudOutline", component: FiCloud },
      { name: "CloudRain", component: FaCloudRain, color: "#90A4AE" },
      { name: "CloudRainOutline", component: FiCloudRain },
      { name: "CloudSnow", component: FaSnowflake, color: "#90A4AE" },
      { name: "CloudSnowOutline", component: FiCloudSnow },
      { name: "Wind", component: FaWind, color: "#90A4AE" },
      { name: "WindOutline", component: FiWind },
      { name: "Umbrella", component: FaUmbrella, color: "#3F51B5" },
      { name: "UmbrellaOutline", component: FiUmbrella },
      { name: "Thermometer", component: FaThermometerHalf, color: "#F44336" },
      { name: "ThermometerOutline", component: FiThermometer },
      { name: "Lightning", component: FaBolt, color: "#FFC107" },
      { name: "LightningOutline", component: FiZap },
    ],
  },
  {
    id: "transportation",
    name: "Transportation",
    icons: [
      { name: "Car", component: FaCar, color: "#607D8B" },
      { name: "Plane", component: FaPlane, color: "#2196F3" },
      { name: "Train", component: FaTrain, color: "#F44336" },
      { name: "Bus", component: FaBus, color: "#4CAF50" },
      { name: "Bicycle", component: FaBicycle, color: "#FF9800" },
      { name: "Ship", component: FaShip, color: "#2196F3" },
      { name: "Navigation", component: FiNavigation },
      { name: "Truck", component: FiTruck },
    ],
  },
  {
    id: "business",
    name: "Business",
    icons: [
      { name: "CreditCard", component: FaCreditCard, color: "#607D8B" },
      { name: "CreditCardOutline", component: FiCreditCard },
      { name: "Money", component: FaMoneyBillWave, color: "#4CAF50" },
      { name: "MoneyOutline", component: FiDollarSign },
      { name: "ChartLine", component: FaChartLine, color: "#2196F3" },
      { name: "ChartLineOutline", component: FiTrendingUp },
      { name: "ChartBar", component: FaChartBar, color: "#9C27B0" },
      { name: "ChartBarOutline", component: FiBarChart2 },
      { name: "ChartPie", component: FaChartPie, color: "#FF9800" },
      { name: "ChartPieOutline", component: FiPieChart },
      { name: "Activity", component: FiActivity },
    ],
  },
  {
    id: "tech",
    name: "Technology",
    icons: [
      { name: "Desktop", component: FaDesktop, color: "#607D8B" },
      { name: "DesktopOutline", component: FiMonitor },
      { name: "Code", component: FaCode, color: "#2196F3" },
      { name: "CodeOutline", component: FiCode },
      { name: "Database", component: FaDatabase, color: "#9C27B0" },
      { name: "DatabaseOutline", component: FiDatabase },
      { name: "Server", component: FaServer, color: "#607D8B" },
      { name: "ServerOutline", component: FiServer },
      { name: "Wifi", component: FaWifi, color: "#4CAF50" },
      { name: "WifiOutline", component: FiWifi },
      { name: "Bluetooth", component: FaBluetooth, color: "#2196F3" },
      { name: "BluetoothOutline", component: FiBluetooth },
      { name: "Battery", component: FaBatteryFull, color: "#4CAF50" },
      { name: "BatteryOutline", component: FiBattery },
      { name: "BatteryCharging", component: FiBatteryCharging },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    icons: [
      { name: "Facebook", component: FaFacebook, color: "#1877F2" },
      { name: "FacebookOutline", component: FiFacebook },
      { name: "Twitter", component: FaTwitter, color: "#1DA1F2" },
      { name: "TwitterOutline", component: FiTwitter },
      { name: "Instagram", component: FaInstagram, color: "#E4405F" },
      { name: "InstagramOutline", component: FiInstagram },
      { name: "LinkedIn", component: FaLinkedin, color: "#0A66C2" },
      { name: "LinkedInOutline", component: FiLinkedin },
      { name: "YouTube", component: FaYoutube, color: "#FF0000" },
      { name: "YouTubeOutline", component: FiYoutube },
      { name: "WhatsApp", component: FaWhatsapp, color: "#25D366" },
      { name: "Telegram", component: FaTelegram, color: "#0088CC" },
      { name: "Snapchat", component: FaSnapchat, color: "#FFFC00" },
      { name: "Pinterest", component: FaPinterest, color: "#E60023" },
      { name: "Reddit", component: FaReddit, color: "#FF4500" },
      { name: "Twitch", component: FaTwitch, color: "#9146FF" },
      { name: "Discord", component: FaDiscord, color: "#5865F2" },
      { name: "GitHub", component: FaGithub, color: "#181717" },
      { name: "GitHubOutline", component: FiGithub },
      { name: "GitLab", component: FaGitlab, color: "#FC6D26" },
      { name: "GitLabOutline", component: FiGitlab },
    ],
  },
  {
    id: "user",
    name: "User & People",
    icons: [
      { name: "User", component: FaUser, color: "#607D8B" },
      { name: "UserOutline", component: FiUser },
      { name: "Users", component: FaUsers, color: "#607D8B" },
      { name: "UsersOutline", component: FiUsers },
      { name: "Walking", component: FaWalking, color: "#607D8B" },
      { name: "Running", component: FaRunning, color: "#FF9800" },
      { name: "Swimming", component: FaSwimmer, color: "#2196F3" },
      { name: "Hiking", component: FaHiking, color: "#795548" },
    ],
  },
  {
    id: "files",
    name: "Files & Folders",
    icons: [
      { name: "File", component: FaFile, color: "#607D8B" },
      { name: "FileOutline", component: FiFile },
      { name: "Folder", component: FaFolder, color: "#FFC107" },
      { name: "FolderOutline", component: FiFolder },
      { name: "Save", component: FaSave, color: "#2196F3" },
      { name: "SaveOutline", component: FiSave },
      { name: "Trash", component: FaTrash, color: "#F44336" },
      { name: "TrashOutline", component: FiTrash },
      { name: "Edit", component: FaEdit, color: "#9C27B0" },
      { name: "EditOutline", component: FiEdit },
      { name: "Search", component: FaSearch, color: "#607D8B" },
      { name: "SearchOutline", component: FiSearch },
    ],
  },
  {
    id: "time",
    name: "Time & Calendar",
    icons: [
      { name: "Calendar", component: FaCalendar, color: "#F44336" },
      { name: "CalendarOutline", component: FiCalendar },
      { name: "Clock", component: FaClock, color: "#2196F3" },
      { name: "ClockOutline", component: FiClock },
      { name: "Bell", component: FaBell, color: "#FFC107" },
      { name: "BellOutline", component: FiBell },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icons: [
      { name: "Apple", component: FaApple, color: "#F44336" },
      { name: "Pizza", component: FaPizzaSlice, color: "#FF9800" },
      { name: "Hamburger", component: FaHamburger, color: "#795548" },
      { name: "IceCream", component: FaIceCream, color: "#E91E63" },
      { name: "Coffee", component: FaCoffee, color: "#795548" },
      { name: "CoffeeOutline", component: FiCoffee },
      { name: "Beer", component: FaBeer, color: "#FFC107" },
      { name: "Wine", component: FaWineGlass, color: "#9C27B0" },
      { name: "Cocktail", component: FaCocktail, color: "#E91E63" },
    ],
  },
  {
    id: "sports",
    name: "Sports",
    icons: [
      { name: "Soccer", component: FaFutbol, color: "#4CAF50" },
      { name: "Basketball", component: FaBasketballBall, color: "#FF9800" },
      { name: "Baseball", component: FaBaseballBall, color: "#F44336" },
      { name: "Football", component: FaFootballBall, color: "#795548" },
      { name: "Golf", component: FaGolfBall, color: "#FFFFFF" },
      { name: "TableTennis", component: FaTableTennis, color: "#2196F3" },
      { name: "Volleyball", component: FaVolleyballBall, color: "#FFC107" },
    ],
  },
]

interface IconPickerProps {
  onIconSelect: (IconComponent: any, iconName: string, size: number, color?: string) => void
}

export function SimplifiedIconPicker({ onIconSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("general")
  const [iconSize, setIconSize] = useState(24)
  const [iconColor, setIconColor] = useState("#000000")
  const [showHelp, setShowHelp] = useState(false)
  const [useCustomColor, setUseCustomColor] = useState(false)

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (searchTerm) {
      // Search across all categories when there's a search term
      const allIcons = iconCategories.flatMap((category) => category.icons)
      return allIcons.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()))
    } else {
      // Otherwise show the active category
      const category = iconCategories.find((c) => c.id === activeCategory)
      return category ? category.icons : []
    }
  }, [activeCategory, searchTerm])

  const handleIconClick = (IconComponent: any, iconName: string, defaultColor?: string) => {
    onIconSelect(IconComponent, iconName, iconSize, useCustomColor ? iconColor : defaultColor)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Add icon">
          <Image className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Icon Picker</DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHelp(!showHelp)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          {showHelp && (
            <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
              <p>Browse icons by category or search by name. Click an icon to add it to your journal.</p>
              <p className="mt-1">Once added, you can drag, resize, and rotate the icon as needed.</p>
            </div>
          )}
        </DialogHeader>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="icon-size" className="text-sm whitespace-nowrap">
              Size: {iconSize}px
            </Label>
            <Slider
              id="icon-size"
              min={16}
              max={64}
              step={4}
              value={[iconSize]}
              onValueChange={(value) => setIconSize(value[0])}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="use-custom-color" className="text-sm">
              Custom Color:
            </Label>
            <input
              id="use-custom-color"
              type="checkbox"
              checked={useCustomColor}
              onChange={(e) => setUseCustomColor(e.target.checked)}
              className="mr-2"
            />
            <Input
              type="color"
              value={iconColor}
              onChange={(e) => setIconColor(e.target.value)}
              className="w-12 h-8 p-1"
              disabled={!useCustomColor}
            />
          </div>
        </div>

        {searchTerm ? (
          // Show search results with improved layout
          <div className="border rounded-md">
            <ScrollArea className="h-[350px]">
              <div className="p-2 pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredIcons.length > 0 ? (
                  filteredIcons.map((icon) => (
                    <div
                      key={icon.name}
                      className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleIconClick(icon.component, icon.name, (icon as any).color)}
                      title={icon.name}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", icon.name)
                        const ghostImg = document.createElement("div")
                        document.body.appendChild(ghostImg)
                        e.dataTransfer.setDragImage(ghostImg, 0, 0)
                        setTimeout(() => document.body.removeChild(ghostImg), 0)
                      }}
                    >
                      <div className="h-8 flex items-center justify-center">
                        {React.createElement(icon.component, {
                          size: Math.min(iconSize, 24),
                          color: useCustomColor ? iconColor : (icon as any).color,
                        })}
                      </div>
                      <span className="text-xs text-center mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {icon.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No icons found. Try a different search term.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Show categories with improved layout
          <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-2 flex flex-wrap h-auto">
              {iconCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="px-3 py-1 text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="border rounded-md">
              <ScrollArea className="h-[350px]">
                <div className="p-2 pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredIcons.map((icon) => (
                    <div
                      key={icon.name}
                      className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleIconClick(icon.component, icon.name, (icon as any).color)}
                      title={icon.name}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", icon.name)
                        const ghostImg = document.createElement("div")
                        document.body.appendChild(ghostImg)
                        e.dataTransfer.setDragImage(ghostImg, 0, 0)
                        setTimeout(() => document.body.removeChild(ghostImg), 0)
                      }}
                    >
                      <div className="h-8 flex items-center justify-center">
                        {React.createElement(icon.component, {
                          size: Math.min(iconSize, 24),
                          color: useCustomColor ? iconColor : (icon as any).color,
                        })}
                      </div>
                      <span className="text-xs text-center mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {icon.name}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

