"use client"

import { useState, useEffect } from "react"
import { Download, FileText, ChevronDown, ChevronUp, Tag } from "lucide-react"
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
  const [formattedNotes, setFormattedNotes] = useState<string>("")
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

        // Format the release notes
        if (data.body) {
          setFormattedNotes(formatGitHubMarkdown(data.body))
        }
      } catch (err) {
        console.error("Error fetching release:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestRelease()
  }, [repoOwner, repoName])

  // Format GitHub markdown to HTML with proper styling
  const formatGitHubMarkdown = (markdown: string): string => {
    if (!markdown) return ""

    let html = markdown

    // Replace emoji shortcodes with actual emojis
    const emojiMap: Record<string, string> = {
      ":rocket:": "🚀",
      ":sparkles:": "✨",
      ":star:": "⭐",
      ":zap:": "⚡",
      ":fire:": "🔥",
      ":bug:": "🐛",
      ":tada:": "🎉",
      ":books:": "📚",
      ":wrench:": "🔧",
      ":gear:": "⚙️",
      ":hammer:": "🔨",
      ":art:": "🎨",
      ":memo:": "📝",
      ":bulb:": "💡",
      ":chart_with_upwards_trend:": "📈",
      ":robot:": "🤖",
      ":gem:": "💎",
      ":speech_balloon:": "💬",
      ":mag:": "🔍",
      ":lock:": "🔒",
    }

    // Replace emoji codes
    for (const [code, emoji] of Object.entries(emojiMap)) {
      html = html.replace(new RegExp(code, "g"), emoji)
    }

    // Process headers with emoji - Fixed to handle more complex header patterns
    html = html.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, headerContent) => {
      const level = hashes.length
      return `<h${level} class="font-bold text-${level === 1 ? "xl" : level === 2 ? "lg" : "base"} mt-4 mb-2">${headerContent}</h${level}>`
    })

    // Process lists with emoji bullets
    html = html.replace(/^(\s*)-\s*([^\s\n]+)?\s*(.+)$/gm, (match, indent, possibleEmoji, text) => {
      const indentLevel = indent.length / 2
      const indentClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : ""

      // Check if possibleEmoji is an emoji
      const isEmoji = possibleEmoji && /\p{Emoji}/u.test(possibleEmoji)

      if (isEmoji) {
        return `<div class="flex items-start gap-2 my-1 ${indentClass}"><span class="flex-shrink-0">${possibleEmoji}</span><span>${text}</span></div>`
      } else {
        // If no emoji or not recognized as emoji, treat as regular text
        const fullText = possibleEmoji ? `${possibleEmoji} ${text}` : text
        return `<div class="flex items-start gap-2 my-1 ${indentClass}"><span class="flex-shrink-0">•</span><span>${fullText}</span></div>`
      }
    })

    // Process bold text
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Process italic text
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Process inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')

    // Process links - fixed to use correct markdown link format
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
    )

    // Fix the "generalist contributors" formatting issue
    html = html.replace(
      /Tailored for generalist contributors/g,
      "Tailored for <strong>generalist contributors</strong>",
    )

    // Convert newlines to <br> tags
    html = html.replace(/\n/g, "<br>")

    return html
  }

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
  const downloadCount = exeFile?.download_count

  if (loading) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!release || !exeFile) {
    return null
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="p-4">
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

          {releaseName && releaseName !== release.tag_name && <p className="text-xs font-medium">{releaseName}</p>}

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

          {formattedNotes && (
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
              <CollapsibleContent className="mt-2 border-t pt-3">
                <div
                  className="text-sm space-y-1 release-notes"
                  dangerouslySetInnerHTML={{ __html: formattedNotes }}
                ></div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  )
}