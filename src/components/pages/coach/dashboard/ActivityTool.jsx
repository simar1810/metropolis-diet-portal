import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ActivityTool({ activities }) {
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);

  const onSelect = () => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }

  const scrollToIndex = (index) => {
    if (!api) return
    api.scrollTo(index)
  }
  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    }
  }, [api])

  useEffect(function () {
    const interval = setInterval(() => {
      setCurrent(prev => prev === activities.length - 1 ? 0 : prev + 1);
      if (api && api.canScrollNext()) {
        api.scrollNext()
      } else if (api) {
        api.scrollTo(0)
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [api])

  return <Card className="grow relative !bg-transparent py-0 border-0 shadow-none mb-4 md:mb-8">
    <CardHeader className="w-full absolute top-0 px-0 flex translate-y-[-105%] items-center justify-between">
      {/* <CardTitle>Programs</CardTitle> */}
      {/* <Button variant="wz">+ Add</Button> */}
    </CardHeader>
    <CardContent className="pt-0 px-0">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {activities.map((activity, index) => <CarouselItem
            key={index}
            className="max-h-[300px] aspect-video relative"
          >
            <Link href={activity.link || "#"} target="_blank">
              <Image
                src={activity.image || "/not-found.png"}
                fill
                onError={e => e.target.src = "/not-found.png"}
                alt=""
                className="w-full bg-[var(--primary-1)] object-contain object-center pl-4 border-1"
              />
            </Link>
          </CarouselItem>)}
        </CarouselContent>
      </Carousel>

      <div className="bg-[var(--dark-1)]/50 absolute bottom-2 left-1/2 translate-x-[-50%] px-[4px] py-[2px] flex justify-center gap-[2px] rounded-full">
        {Array.from({ length: activities.length }, (_, i) => i).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={cn(
              "w-[10px] h-[10px] rounded-full transition-colors",
              current === index ? "bg-[var(--accent-1)]" : "bg-[#D9D9D9] hover:bg-gray-400",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </CardContent>
  </Card>
}