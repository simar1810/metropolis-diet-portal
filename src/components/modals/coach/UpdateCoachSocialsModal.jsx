import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { coachPortfolioSocialLinks } from "@/config/data/ui";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function UpdateCoachSocialsModal({ socialLinks }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => generateDefaultPayload(socialLinks));

  const closeBtnRef = useRef(null);

  async function updateSocialMediaLinks() {
    try {
      setLoading(true);
      const response = await sendData(`app/sm`, formData, "POST");
      if (!response.data) throw new Error(response.message);
      toast.success(response.message);
      mutate("getCoachSocialLinks");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="bg-[var(--accent-1)] text-white text-[14px] font-semibold px-5 py-2 rounded-[8px] block mx-auto mt-10">
      Edit
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">Social Links</DialogTitle>
      <div>
        <p className="text-[14px] font-semibold text-left mb-4">Enter Link and Connect Your Social Accounts</p>
        {coachPortfolioSocialLinks.map(social => <SocialLinkCard
          key={social.id}
          value={formData[social.name]}
          onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          social={social}
        />)}
        <Button
          variant="wz"
          onClick={updateSocialMediaLinks}
          disabled={loading}
          className="mt-8"
        >
          Save details
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}

function SocialLinkCard({
  social,
  ...props
}) {
  return <div className="mb-4 flex item-stretch rounded-[8px] border-1">
    <div className="bg-[#D9D9D9]/25 p-2">{social.icon}</div>
    <Input
      className="h-auto !rounded-l-none border-0 shadow-none"
      name={social.name}
      {...props}
    />
  </div>
}

function generateDefaultPayload(obj) {
  const socialLinks = ["facebookLink", "instagramLink", "linkedinLink", "whatsappNumber", "youtubeLink", "supportNumber"];
  const payload = {};
  for (const social of socialLinks) {
    payload[social] = obj[social] || "";
  }
  return payload;
}