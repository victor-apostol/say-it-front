import Link from "next/link";

type Props = {
  urlTarget: string;
  imgSource: string;
  optionText: string;
  prefetch?: boolean;
  styles?: string;
}

export const MenuOption = ({ urlTarget, imgSource, optionText, prefetch = false, styles = '' }: Props) => {
  return (
    <Link href={urlTarget} prefetch={prefetch} className="max-w-min">
      <div className={`hover:bg-neutral-800 rounded-full p-2 flex items-center ${styles}`}>
        <img className="max-w-[26.25px] max-h-[26.25px]" src={imgSource} alt="" />
        <p className="hidden md:block font-normal text-xl">{optionText}</p> 
      </div>
    </Link>
  )
}

export default MenuOption;