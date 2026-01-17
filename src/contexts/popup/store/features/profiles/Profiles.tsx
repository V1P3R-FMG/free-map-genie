import { Profile } from "./Profile";
import { useAppDispatch, useAppSelector } from "@/contexts/popup/hooks";
import {
  selectProfiles,
  selectProfilesLoading,
  getProfilesAsync,
  addGuestProfileAsync,
  deleteGuestProfileAsync,
} from "./profilesSlice";

import style from "./Profiles.module.scss";
import { Loading } from "@/components/Loading";
import { FontIcon } from "@/components/FontIcon";

export const Profiles = ({}: Profiles.Props) => {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectProfiles);
  const loading = useAppSelector(selectProfilesLoading);

  React.useEffect(() => {
    dispatch(getProfilesAsync());
  }, []);

  return (
    <Loading loading={loading}>
      <div className={style.profiles}>
        <div className={style.profilesList}>
          {profiles.length === 0 && <p>User not logged in.</p>}
          {profiles.map((profile) => (
            <Profile key={profile.id} profile={profile} />
          ))}
          {profiles.length > 0 && (
            <div>
              <button
                id={style.addProfileButton}
                onClick={() => dispatch(addGuestProfileAsync())}
              >
                <FontIcon icon="plus" />
              </button>
              <button
                id={style.deleteProfileButton}
                onClick={() => dispatch(deleteGuestProfileAsync())}
              >
                <FontIcon icon="minus" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Loading>
  );
};

export namespace Profiles {
  export interface Props {}
}
