import { Button } from "@/components/ui/button";

export default function NextButton({ handler }) {
  return <Button
    onClick={handler}
    variant="wz"
    className="w-full mt-4"
  >
    Next
  </Button>
}