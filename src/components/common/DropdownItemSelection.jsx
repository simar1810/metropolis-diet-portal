
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";
import { nameInitials } from "@/lib/formatter";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMemo, useState } from "react";

export default function DropdownItemSelection({
  items,
  value = "",
  onSelectItem,
  placeholder = "Select Record"
}) {
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    const regex = new RegExp(query, "i")
    return items.filter(item => regex.test(item.title))
  }, [query])

  return <div>
    <Select
      value={value}
      onValueChange={value => onSelectItem(value)}
    >
      <SelectTrigger className="w-full py-2 border-[#808080] focus:shadow-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        align="start"
        className="max-h-[250px] !gap-0 !space-y-0 border-[#808080]"
      >
        <div
          className="px-2 pb-2 sticky top-[-4px] bg-white z-[100]"
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
        >
          <Input
            value={query}
            onChange={e => setQuery((e.target.value))}
            className="mb-2 block"
            placeholder="Search by name..."
          />
        </div>
        {filteredItems.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No Records found
          </div>
        )}
        {filteredItems.map(item => <SelectItem
          key={item.id}
          value={item.value}
        >
          {item.avatar && <Avatar>
            <AvatarImage src={item.avatar} />
            <AvatarFallback>{nameInitials(item.title)}</AvatarFallback>
          </Avatar>}
          {item.title}
        </SelectItem>)}
      </SelectContent>
    </Select>
  </div>
}