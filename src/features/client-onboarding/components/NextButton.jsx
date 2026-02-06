import { Button } from "@/components/ui/button";

export default function NextButton({
  handler,
  ...args
}) {
  return <Button
    onClick={handler}
    variant="wz"
    className="w-full mt-4"
    {...args}
  >
    Next
  </Button>
}