'use client'

import ActionWarningModal from "@/components/modals/actionWarningModal";
import Modal from "@/components/modals/modal";
import PopUpMessage from "@/components/ui/errors/popUpMessage";
import { videoExtensionsWhitelist } from "@/constants/global.constants";
import { updateUserProfile } from "@/services/user.service";
import { Session } from "next-auth";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type Props = {
  session: Session;
  currentProfileImage: string;
  currentBackgroundImage: string;
  setEditProfileOn: Dispatch<SetStateAction<boolean>>;
  setCurrentBackgroundImage: Dispatch<SetStateAction<string>>;
  setCurrentProfileImage: Dispatch<SetStateAction<string>>;
  setCurrentName: Dispatch<SetStateAction<string>>;
  setCurrentBio: Dispatch<SetStateAction<string>>;
  currentName: string;
  currentBio: string;
}

const defaultBackgroundImageUrl = process.env.NEXT_PUBLIC_DEFAULT_BACKGROUND_IMAGE;

const EditProfile = ({ 
  session, 
  setEditProfileOn, 
  currentProfileImage, 
  currentBackgroundImage,
  setCurrentProfileImage, 
  setCurrentBackgroundImage, 
  setCurrentName,
  setCurrentBio,
  currentName,
  currentBio
}: Props) => {
  const [name, setName] = useState<string>(currentName);
  const [bio, setBio] = useState<string>(currentBio);
  const [newBackground, setNewBackground] = useState<File | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [defaultBackground, setDefaultBackground] = useState<boolean>(defaultBackgroundImageUrl === currentBackgroundImage);

  const [apiError, setApiError] = useState<null | string>(null);
  const [warningModal, setWarningModal] = useState<boolean>(false);

  const handleUpdateProfile = async () => {
    try {
      if (name.length > 0 || bio.length > 0 || newBackground || newAvatar || defaultBackground) {
        const requestData = { name, bio, newAvatar, newBackground };
    
        for (const key of Object.keys(requestData)) {
          if (requestData[key as keyof typeof requestData] === null || requestData[key as keyof typeof requestData] === "") {
            delete requestData[key as keyof typeof requestData];
          }
        }

        const response = await updateUserProfile(
          session.accessToken,  
          { ...requestData, defaultBackground }
        );
        
        newAvatar && setCurrentProfileImage(URL.createObjectURL(newAvatar));
        newBackground 
          ? setCurrentBackgroundImage(URL.createObjectURL(newBackground))
          : setCurrentBackgroundImage(defaultBackgroundImageUrl);

        setCurrentName(response.data.name);
        setCurrentBio(response.data.bio);
      }
      
      setEditProfileOn(false);
    } catch(err: any) {
      setApiError(err.response.data.message)
    }
  }

  const handleAddMedia = (e: ChangeEvent<HTMLInputElement>, isBackground = false) => {
    if (e.target.files) {
      const individualFile = e.target.files[0];

      const placeholder = individualFile.name.split('.');
      const fileExtenstion = placeholder[placeholder?.length - 1];

      if (videoExtensionsWhitelist.includes(fileExtenstion)) {
        return setApiError(`Only photos can be uploaded`);
      }

      if (!isBackground) return setNewAvatar(e.target.files[0]);

      if (e.target.files) { 
        setNewBackground(e.target.files[0]); 
        setDefaultBackground(false);
      }
    } else if (isBackground) {
      setNewBackground(null);
      setDefaultBackground(true);
    }
  }

  const handleClearCurrentBackground = () => {
    setDefaultBackground(true); 
    setNewBackground(null);
  }

  const handleBioTyping = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 120) setBio(e.target.value);
  }

  const hanldeNameTyping = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 32) setName(e.target.value);
  }

  const handleDiscardEditProfile = () => {
    if (name !== currentName || bio !== currentBio || newBackground || newAvatar) setWarningModal(true);
    else setEditProfileOn(false);
  }

  return (
    <Modal 
      setModalOn={setEditProfileOn} 
      customOnClickAction={() => handleDiscardEditProfile()}
      closeOnOutsideClick={false}
    >
      <div 
        className="overflow-y-auto bg-[#000000] sm:rounded-2xl w-full h-full sm:w-[600px] sm:h-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between sticky top-0 z-10 bg-[black] bg-opacity-50 backdrop-blur-[20px] items-center px-2">
          <div className="flex justify-between gap-4 items-center">
            <div 
              className="rounded-full w-8 h-8 hover:bg-neutral-900 transition-colors duration-700 cursor-pointer"
              onClick={() => handleDiscardEditProfile()}
            >
              <img className="font-medium text-sm p-2 rounded-full" src="/assets/x_icon.png" alt="x_icon"/>
            </div>
            <p className="font-semibold text-lg pb-2 pl-2 pt-2">Edit Profile</p>
          </div>

          <div 
            className="flex items-center h-[32px] rounded-3xl bg-[white] font-medium text-sm px-4 text-[black] cursor-pointer"
            onClick={() => handleUpdateProfile()}
          >
            <p>Save</p>
          </div>
        </div>
        
        <div className="h-[200px] bg-zinc-900 relative">
          { defaultBackground 
            ? <div className="w-full h-full bg-gray"></div>
            
            : <img 
                className="object-cover h-full w-full opacity-70" 
                src={newBackground ? URL.createObjectURL(newBackground) : currentBackgroundImage} 
                // alt="background_image" 
              />
          }

          <div className="absolute flex justify-center items-center w-full top-0 translate-y-[200%] gap-6">
            <div className="relative">
              <label htmlFor="background_image" className="flex items-center w-[40px]">
                <input 
                  id="background_image"
                  className="opacity-0 w-[40px] h-[40px] inset-0 w-full" 
                  type="file" 
                  onChange={e => handleAddMedia(e, true)}
                  //accept=".jpeg,.png.,.jpg,.mp4,.mp3,.svg"
                />

                <div className="absolute top-0 left-0 cursor-pointer bg-[#2a2a28] rounded-full p-3 rounded-full transition duration-300 ease-in-out transform hover:opacity-80 cursor-pointer">
                  <img className="w-4 h-4" src="/assets/add_photo_icon.png" alt="add_photo_icon" />
                </div>
              </label>
            </div>

            {!defaultBackground &&
              <div 
                className="p-3 bg-[#2a2a28] rounded-full transition duration-300 ease-in-out transform hover:opacity-80 cursor-pointer"
                onClick={() => handleClearCurrentBackground()}
              >
                <img className="w-4 h-4" src="/assets/x_icon.png" alt="x_icon" />
              </div>
            }
          </div>

          <div className="absolute bottom-0 left-4 h-[112px] w-[112px] translate-y-[50%]" >
            <img 
              className="h-full rounded-full object-cover border-4 border-[black] transition duration-300 ease-in-out transform grayscale-[25%]"
              src={newAvatar ? URL.createObjectURL(newAvatar) : currentProfileImage} 
              alt="avatar_photo" 
            />

            <label htmlFor="profile_image" className="flex items-center absolute top-0 left-0 w-[32px] translate-y-[125%] translate-x-[125%]">
              <input 
                id="profile_image"
                className="opacity-0 h-[32px] w-[32px] inset-0 w-full cursor-pointer" 
                type="file" 
                onChange={e => handleAddMedia(e)}
                //accept=".jpeg,.png.,.jpg,.mp4,.mp3,.svg"
              />

              <div className="absolute top-0 left-0 cursor-pointer bg-[#2a2a28] rounded-full p-2 rounded-full transition duration-300 ease-in-out transform opacity-80 hover:opacity-50 cursor-pointer">
                <img className="w-4 h-4" src="/assets/add_photo_icon.png" alt="add_photo_icon" />
              </div>
            </label>
          </div>
        </div>      

        <div className="px-4">
          <div className="h-[74px]"></div>

          <div className="relative mb-8">
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={e => hanldeNameTyping(e)}
              className="w-full pt-6 font-normal focus:border-none block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-[black] appearance-none dark:text-white dark:border-gray-700 dark:focus:border-light_blue focus:outline-none focus:ring focus:border-light_blue peer" 
              placeholder=" " 
            />
            <label 
              htmlFor="name" 
              className="absolute text-sm text-gray-500 font-normal dark:text-gray-400 duration-300 transform -translate-y-4 scale-[85%] top-4 z-10 origin-[0] left-2.5 peer-focus:text-light_blue peer-focus:dark:text-light_blue peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-4"
            >
              Name
            </label>
            <span  className="absolute left-[94%] hidden text-md text-gray-500 font-normal dark:text-gray-400 duration-300 top-0 left-0 transform -translate-y-4 scale-[85%] top-4 z-10 origin-[0] left-2.5 peer-focus:text-[#5A5A5A] peer-focus:dark:text-[#5A5A5A] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-4 peer-focus:block">
              {name.length}/32
            </span>
          </div>

          <div className="relative mb-8">
            <textarea 
              id="bio" 
              value={bio}
              onChange={e => handleBioTyping(e)} 
              rows={3}
              className="w-full pt-[30px] overflow-y-hidden resize-none font-normal focus:border-none block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-[black] appearance-none dark:text-white dark:border-gray-700 dark:focus:border-light_blue focus:outline-none focus:ring focus:border-light_blue peer" 
              placeholder=" " 
            />
            <label 
              htmlFor="bio" 
              className="absolute text-sm font-normal text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-[85%] top-4 z-10 origin-[0] left-2.5 peer-focus:text-light_blue peer-focus:dark:text-light_blue peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-4"
            >
              Bio
            </label>
            <span  className="absolute left-[98%] hidden text-md text-gray-500 font-normal dark:text-gray-400 duration-300 transform -translate-y-4 -translate-x-[70%] scale-[85%] top-4 z-10 origin-[0] left-2.5 peer-focus:text-[#5A5A5A] peer-focus:dark:text-[#5A5A5A] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-4 peer-focus:block">
              {bio.length}/120
            </span>
          </div>
        </div>
      </div>  

      { apiError && 
        <PopUpMessage 
          text={apiError} 
          setText={setApiError}
        /> 
      }

      { warningModal &&
        <ActionWarningModal 
          mainWarningText="Discard changes?"
          warningText="This can't be undone and you'll lose your changes."
          actionText="Discard"
          setWarningModal={setWarningModal}
          onClickAction={() => setEditProfileOn(false)}
        />
      }
    </Modal>
  )
}

export default EditProfile;