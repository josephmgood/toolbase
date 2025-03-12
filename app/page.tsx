"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Search, ExternalLink, Plus, Download, Upload, X } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define the Tool type
type Tool = {
  id: number
  name: string
  url: string
  description: string
  niches: string[]
}

// Initial sample tool data
const initialToolsData: Tool[] = [
  {
    id: 1,
    name: "Figma",
    url: "https://figma.com",
    description: "Design, prototype, and collaborate all in the browser",
    niches: ["Design", "Product"],
  },
  {
    id: 2,
    name: "GitHub",
    url: "https://github.com",
    description: "Where the world builds software",
    niches: ["Dev"],
  },
  {
    id: 3,
    name: "Notion",
    url: "https://notion.so",
    description: "All-in-one workspace for notes, tasks, wikis, and databases",
    niches: ["Product", "Community", "Playbook"],
  },
  {
    id: 4,
    name: "Airtable",
    url: "https://airtable.com",
    description: "Part spreadsheet, part database, and entirely flexible",
    niches: ["Product", "GTM + Sales + Marketing"],
  },
  {
    id: 5,
    name: "Webflow",
    url: "https://webflow.com",
    description: "Build responsive websites visually",
    niches: ["Design", "Dev"],
  },
]

// All available niches
const allNiches = ["Product", "Design", "VC", "Community", "GTM + Sales + Marketing", "Dev", "CPG", "IRL", "Playbook"]

export default function ToolDirectory() {
  const { toast } = useToast()
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newTool, setNewTool] = useState<Omit<Tool, "id">>({
    name: "",
    url: "",
    description: "",
    niches: [],
  })
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState("")

  // Load tools from localStorage on initial render
  useEffect(() => {
    const savedTools = localStorage.getItem("toolDirectory")
    if (savedTools) {
      setTools(JSON.parse(savedTools))
    } else {
      setTools(initialToolsData)
      localStorage.setItem("toolDirectory", JSON.stringify(initialToolsData))
    }
  }, [])

  // Toggle niche selection for filtering
  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche))
    } else {
      setSelectedNiches([...selectedNiches, niche])
    }
  }

  // Toggle niche selection for new tool
  const toggleToolNiche = (niche: string) => {
    if (newTool.niches.includes(niche)) {
      setNewTool({
        ...newTool,
        niches: newTool.niches.filter((n) => n !== niche),
      })
    } else {
      setNewTool({
        ...newTool,
        niches: [...newTool.niches, niche],
      })
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedNiches([])
    setSearchQuery("")
  }

  // Add a new tool
  const addTool = () => {
    // Validate form
    if (!newTool.name.trim()) {
      toast({
        title: "Error",
        description: "Tool name is required",
        variant: "destructive",
      })
      return
    }

    if (!newTool.url.trim()) {
      toast({
        title: "Error",
        description: "Tool URL is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Validate URL format
      new URL(newTool.url)
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (include https://)",
        variant: "destructive",
      })
      return
    }

    if (newTool.niches.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one niche",
        variant: "destructive",
      })
      return
    }

    // Create new tool with unique ID
    const newId = tools.length > 0 ? Math.max(...tools.map((t) => t.id)) + 1 : 1
    const toolToAdd = { ...newTool, id: newId }

    // Add to tools array
    const updatedTools = [...tools, toolToAdd]
    setTools(updatedTools)

    // Save to localStorage
    localStorage.setItem("toolDirectory", JSON.stringify(updatedTools))

    // Reset form
    setNewTool({
      name: "",
      url: "",
      description: "",
      niches: [],
    })

    toast({
      title: "Success",
      description: `${toolToAdd.name} has been added to the directory`,
    })
  }

  // Delete a tool
  const deleteTool = (id: number) => {
    const updatedTools = tools.filter((tool) => tool.id !== id)
    setTools(updatedTools)
    localStorage.setItem("toolDirectory", JSON.stringify(updatedTools))

    toast({
      title: "Tool removed",
      description: "The tool has been removed from the directory",
    })
  }

  // Export tools as JSON
  const exportTools = () => {
    const dataStr = JSON.stringify(tools, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `tool-directory-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Export successful",
      description: "Your tool directory has been exported as JSON",
    })
  }

  // Import tools from JSON
  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData)

      if (!Array.isArray(parsedData)) {
        throw new Error("Invalid data format")
      }

      // Validate each tool has required fields
      parsedData.forEach((tool: any) => {
        if (!tool.id || !tool.name || !tool.url || !Array.isArray(tool.niches)) {
          throw new Error("Invalid tool data format")
        }
      })

      setTools(parsedData)
      localStorage.setItem("toolDirectory", JSON.stringify(parsedData))

      setIsImporting(false)
      setImportData("")

      toast({
        title: "Import successful",
        description: `Imported ${parsedData.length} tools to your directory`,
      })
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check your JSON format and try again",
        variant: "destructive",
      })
    }
  }

  // Filter tools based on selected niches and search query
  const filteredTools = tools.filter((tool) => {
    // Filter by niches
    const matchesNiches = selectedNiches.length === 0 || selectedNiches.some((niche) => tool.niches.includes(niche))

    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesNiches && matchesSearch
  })

  // Extract domain from URL for favicon
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain
    } catch (e) {
      return url
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ToolBase</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Tools</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="import-json">Paste JSON data</Label>
                <Textarea
                  id="import-json"
                  placeholder="Paste your tool directory JSON here..."
                  className="h-40 mt-2"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleImport}>Import Tools</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportTools} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Tool</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tool Name *</Label>
                  <Input
                    id="name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    placeholder="e.g. Figma"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={newTool.url}
                    onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                    placeholder="e.g. https://figma.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    placeholder="Brief description of the tool"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Niches *</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allNiches.map((niche) => (
                      <Badge
                        key={niche}
                        variant={newTool.niches.includes(niche) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleToolNiche(niche)}
                      >
                        {niche}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={addTool}>Add Tool</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tools..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">Filter by niche:</h2>
          <div className="flex flex-wrap gap-2">
            {allNiches.map((niche) => (
              <Badge
                key={niche}
                variant={selectedNiches.includes(niche) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleNiche(niche)}
              >
                {niche}
              </Badge>
            ))}
            {(selectedNiches.length > 0 || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-muted-foreground mb-4">
        Showing {filteredTools.length} of {tools.length} tools
      </p>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 relative overflow-hidden rounded-md border">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${getDomain(tool.url)}&sz=128`}
                    alt={`${tool.name} logo`}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <h3 className="font-semibold text-lg">{tool.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteTool(tool.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{tool.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {tool.niches.map((niche) => (
                  <Badge key={niche} variant="secondary" className="text-xs">
                    {niche}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                Visit website <ExternalLink className="h-3 w-3" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools found matching your filters.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      <Toaster />
    </main>
  )
}

