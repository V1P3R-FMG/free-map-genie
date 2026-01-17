import { useAppDispatch } from "@/contexts/popup/hooks";
import { activateProfileAsync } from "./profilesSlice";
import { FontIcon } from "@/components/FontIcon";

import style from "./Profiles.module.scss";

import type { ProfileInfo } from "./profilesSlice";

export const Profile = ({ profile }: Profile.Props) => {
  const dispatch = useAppDispatch();

  const onActivateProfile = () => {
    dispatch(activateProfileAsync(profile.id));
  };

  return (
    <div
      className={clsx(style.profile, { [style.active]: profile.active })}
      onClick={onActivateProfile}
    >
      <FontIcon className={style.profileAvatar} icon="user" />
      <span>{profile.name}</span>
    </div>
  );
};

export namespace Profile {
  export interface Props {
    profile: ProfileInfo;
  }
}
