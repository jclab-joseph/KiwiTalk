use serde::{Deserialize, Serialize};
use talk_loco_client::structs::user::User;

use crate::channel::user::{UserData, UserProfile};

pub type NormalUserData = UserData<NormalUserInfo>;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct NormalUserInfo {
    pub country_iso: String,
    pub account_id: i64,
    pub status_message: Option<String>,
    pub linked_services: Option<String>,
    pub suspended: bool,
}

impl From<User> for UserData<NormalUserInfo> {
    fn from(user: User) -> Self {
        Self {
            id: user.user_id,
            user_type: user.user_type,
            profile: UserProfile {
                nickname: user.nickname,
                image_url: user.profile_image_url,
                full_image_url: user.full_profile_image_url,
                original_image_url: user.original_profile_image_url,
            },
            info: NormalUserInfo {
                country_iso: user.country_iso,
                account_id: user.account_id,
                status_message: Some(user.status_message),
                linked_services: Some(user.linked_services),
                suspended: user.suspended,
            },
        }
    }
}
