"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { changeGender, changeHeightUnit } from "@/config/state-reducers/ideal-weight";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function IdealWeightContainer() {
  return <div className="content-container">
    <h4>What&apos;s your Height?</h4>
    <h2 className="text-[24px] text-left md:text-center mt-10">Select your height</h2>
    <div className="flex flex-col gap-10 md:gap-0">
      <GenderSelection />
      <HeightScale />
    </div>
  </div>
}

function GenderSelection() {
  const { gender, heightUnit, dispatch } = useCurrentStateContext();

  return <div className="flex items-end justify-start md:justify-center gap-4 md:gap-20">
    <RadioGroup value={gender} className="mt-4 flex items-center justify-center gap-4">
      <div className="flex items-center gap-1">
        <input
          id="feet"
          value="male"
          type="radio"
          className="w-[14px] h-[14px]"
          checked={gender === "male"}
          onChange={() => dispatch(changeGender("male"))}
        />
        <Label htmlFor="feet" className="text-[18px]">
          Male
        </Label>
      </div>
      <div className="flex items-center gap-1">
        <input
          id="cms"
          value="female"
          type="radio"
          checked={gender === "female"}
          className="w-[14px] h-[14px]"
          onChange={() => dispatch(changeGender("female"))}
        />
        <Label htmlFor="cms" className="text-[18px]">
          Female
        </Label>
      </div>
    </RadioGroup>
    <div className="flex items-center gap-2">
      <Label
        htmlFor="airplane-mode"
        className="text-[18px]"
        onClick={() => dispatch(changeHeightUnit("foot"))}
      >
        cm
      </Label>
      <Switch
        id="airplane-mode"
        checked={heightUnit === "foot"}
        onClick={() => dispatch(changeHeightUnit(heightUnit === "foot" ? "cm" : "foot"))}
      />
      <Label
        htmlFor="airplane-mode"
        className="text-[18px]"
        onClick={() => dispatch(changeHeightUnit("foot"))}
      >
        foot
      </Label>
    </div>
  </div>
}

function HeightScale() {
  const scaleRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scale = scaleRef.current;
      const divisionHeight = 12;
      const divisionsScrolled = scale.scrollTop / divisionHeight;
      const totalFeet = divisionsScrolled / 10;
      setHeight(totalFeet)
    };

    const scale = scaleRef.current;
    if (scale) {
      scale.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scale) scale.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heightinMetres = height / 3.28084;

  const idealWeight = (21 * (heightinMetres * heightinMetres)).toFixed(2);
  const slightOverWeight = (23 * (heightinMetres * heightinMetres)).toFixed(2);
  const highlyOverWeight = (25 * (heightinMetres * heightinMetres)).toFixed(2);

  return <div className="md:h-96 mt-2 md:mt-20 mb-10 flex flex-col md:flex-row items-center justify-center gap-10">
    <AnatomyImage />
    <HeightDisplay height={height} />
    <div className="w-[120px] bg-[#F0F0F0] rounded-[8px] border-2 border-[var(--accent-1)] relative">
      <Image
        src="/arrow-left.svg"
        alt=""
        height={100}
        width={100}
        className="w-[32px] h-[32px] absolute ml-auto top-48 translate-y-[-50%] right-0 translate-x-[2px]"
      />
      <div ref={scaleRef} className="h-96 scroll- py-48 overflow-y-auto custom-scrollbar">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(item => <div
          key={item}
          className="flex items-center gap-2 snap-start"
        >
          <div className={`mt-[10px] ${item % 5 === 0 || item % 10 === 0 ? "h-[2px] bg-[var(--dark-1)]/50" : "h-[2px] bg-[var(--dark-1)]/25"} ${item % 10 === 0 ? "w-24" : "w-20"}`} />
          <p className="leading-0">{item % 10 === 0 && item / 10}</p>
        </div>)}
      </div>
    </div>
    <div>
      <h4 className="w-full text-center">Your Ideal Weight Is <span className="text-[var(--accent-1)] text-center">{idealWeight} KGs</span></h4>
      <div className="mt-10 flex gap-4">
        <div>
          <Button variant="wz_outline" className="text-center text-[#03632C] block mx-auto border-[#03632C]">{idealWeight} Kg</Button>
          <p className="text-center text-[14px] text-[var(--dark-1)]/25 mt-2">Within Limits</p>
        </div>
        <div>
          <Button variant="wz_outline" className="text-center text-[#FB8A2E] block mx-auto border-[#FB8A2E]">{slightOverWeight} Kg</Button>
          <p className="text-center text-[14px] text-[var(--dark-1)]/25 mt-2">Slightly Overweight</p>
        </div>
        <div>
          <Button variant="wz_outline" className="text-center text-[#FF1D1D] block mx-auto border-[#FF1D1D]">{highlyOverWeight} Kg</Button>
          <p className="text-center text-[14px] text-[var(--dark-1)]/25 mt-2">Highly Overweight</p>
        </div>
      </div>
    </div>
  </div>
}

function AnatomyImage() {
  const { gender } = useCurrentStateContext();
  if (gender === "male") return <Image
    src="/male-anatomy.png"
    alt=""
    height={372}
    width={176}
    draggable={false}
    className="w-[176px] h-[400px] object-contain"
  />
  return <Image
    src="/woman-anatomy.png"
    alt=""
    height={372}
    width={139}
    className="w-[176px] h-[360px] object-contain"
    draggable={false}
  />
}

function HeightDisplay({ height }) {
  const { heightUnit } = useCurrentStateContext();
  if (heightUnit === "cm") return <div className="w-20 flex items-end gap-[3px]">
    <p className="font-bold text-[24px] leading-[1]">{(height * 30.48).toFixed(2)}</p>
    <p className="leading-[1.2] text-[var(--dark-2)]">cm</p>
  </div>
  return <div className="w-20 flex items-end gap-[3px]">
    <p className="font-bold text-[24px] leading-[1]">{Math.floor(height)}</p>
    <p className="leading-[1.2] text-[var(--dark-2)]">ft</p>
    <p className="font-bold text-[24px] leading-[1]">{Math.floor((height - Math.floor(height)) * 12)}</p>
    <p className="leading-[1.2] text-[var(--dark-2)]">in</p>
  </div>
}