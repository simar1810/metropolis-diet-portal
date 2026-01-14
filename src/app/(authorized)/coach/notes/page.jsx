import FormControl from "@/components/FormControl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PenLine, Trash2 } from "lucide-react"

export default function Page() {
  return <div className="content-container">
    <Header />
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => i).map(item => <Note key={item} />)}
    </div>
  </div>
}

function Header() {
  return <div className="mb-4 pb-4 flex items-center gap-4 border-b-1">
    <h4>Notes</h4>
    <FormControl
      className="lg:min-w-[280px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] ml-auto"
      placeholder="Search Notes.."
    />
  </div>
}

function Note() {
  return <Card className="bg-[#FFD8F4] shadow-none gap-2">
    <CardHeader>
      <CardTitle>To-Do List</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-[14px] list-number">
        <li>Reply to emails</li>
        <li>Prepare presentation slides for the marketing meeting</li>
        <li>Conduct research on competitor products</li>
        <li>Conduct research on competitor products</li>
      </ul>
      <div className="mt-4 flex gap-2">
        <PenLine className="w-[28px] h-[28px] bg-white p-1 rounded-[8px]" />
        <Trash2 className="w-[28px] h-[28px] text-white bg-[var(--accent-2)] p-1 rounded-[8px]" />
      </div>
    </CardContent>
  </Card>
}