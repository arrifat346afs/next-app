"use client"

import { useState, useEffect } from "react"
import { Download, AlertCircle, Tag, ChevronDown, ChevronUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Release {
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: {
    name: string
    browser_download_url: string
    size: number
    download_count: number
  }[]
}

export default function AppDownload({
  repoOwner = "arrifat346afs",
  repoName = "react-electron-tagpix-ai",
  appName = "Tagpix AI",
}: {
  repoOwner?: string
  repoName?: string
  appName?: string
}) {
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)

  useEffect(() => {
    // Fetch latest release from GitHub
    const fetchLatestRelease = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`)

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()
        setRelease(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch release data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestRelease()
  }, [repoOwner, repoName])

  const getWindowsExeFile = () => {
    if (!release) return null
    return release.assets.find((asset) => asset.name.toLowerCase().endsWith(".exe"))
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatVersion = (version: string) => {
    return version.startsWith("v") ? version.substring(1) : version
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Simple markdown parser for common elements
  const parseReleaseNotes = (markdown: string) => {
    if (!markdown) return []

    // Split by double newlines to get paragraphs
    const sections = markdown.split(/\n\s*\n/)

    return sections
      .map((section) => {
        // Check if it's a list
        if (section.trim().startsWith("- ") || section.trim().startsWith("* ")) {
          const listItems = section
            .split(/\n/)
            .filter((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "))
            .map((line) => line.replace(/^[-*]\s+/, "").trim())

          return { type: "list", content: listItems }
        }

        // Check if it's a heading
        if (section.trim().startsWith("# ") || section.trim().startsWith("## ")) {
          return {
            type: "heading",
            content: section.replace(/^#+\s+/, "").trim(),
          }
        }

        // Regular paragraph
        return { type: "paragraph", content: section.trim() }
      })
      .filter((item) => item.content.length > 0)
  }

  const downloadExe = () => {
    const exeFile = getWindowsExeFile()
    if (exeFile) {
      window.location.href = exeFile.browser_download_url
    }
  }

  const exeFile = getWindowsExeFile()
  const version = release?.tag_name ? formatVersion(release.tag_name) : null
  const releaseName = release?.name || null
  const releaseDate = release?.published_at ? formatDate(release.published_at) : null
  const releaseNotes = release?.body ? parseReleaseNotes(release.body) : []
  const downloadCount = exeFile?.download_count

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load: {error}</span>
          </div>
        ) : exeFile ? (
          <div className="flex flex-col space-y-3 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{appName}</p>
                {version && (
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5 font-normal">
                    <Tag className="h-3 w-3 mr-1" />
                    {version}
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={downloadExe} className="gap-1 whitespace-nowrap">
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </Button>
            </div>

            {releaseName && releaseName !== release?.tag_name && <p className="text-xs font-medium">{releaseName}</p>}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Windows</span>
              <span>•</span>
              <span>{formatBytes(exeFile.size)}</span>
              {downloadCount !== undefined && (
                <>
                  <span>•</span>
                  <span>{downloadCount.toLocaleString()} downloads</span>
                </>
              )}
              {releaseDate && (
                <>
                  <span>•</span>
                  <span>Released {releaseDate}</span>
                </>
              )}
            </div>

            {releaseNotes.length > 0 && (
              <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen} className="w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto mt-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-medium">Release Notes</span>
                    </div>
                    {isNotesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-sm border-t pt-3">
                  <div className="space-y-3 text-sm">
                    {releaseNotes.map((note, index) => {
                      if (note.type === "heading") {
                        return (
                          <h4 key={index} className="font-medium">
                            {note.content}
                          </h4>
                        )
                      } else if (note.type === "list") {
                        return (
                          <ul key={index} className="list-disc pl-5 space-y-1">
                            {Array.isArray(note.content) ? (
                              note.content.map((item: string, i: number) => (
                                <li key={i} className="text-xs">
                                  {item}
                                </li>
                              ))
                            ) : (
                              <li key={index} className="text-xs">
                                {note.content}
                              </li>
                            )}
                          </ul>
                        )
                      } else {
                        return (
                          <p key={index} className="text-xs">
                            {note.content}
                          </p>
                        )
                      }
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Windows executable found</p>
        )}
      </CardContent>
    </Card>
  )
}
