use dashmap::DashMap;
use std::sync::Arc;

pub struct User {
    pub id: String,
    pub username: String,
    pub display_name: String,
    pub role: String,
    pub active: bool,
    pub created_at: i64,
}

pub struct Session {
    pub session_id: String,
    pub user_id: String,
    pub started_at: i64,
    pub last_activity: i64,
    pub device: String,
}

pub struct UserManager {
    users: DashMap<String, User>,
    sessions: DashMap<String, Session>,
}

impl UserManager {
    pub fn new() -> Self {
        UserManager {
            users: DashMap::new(),
            sessions: DashMap::new(),
        }
    }

    pub fn list_users(&self) -> Vec<User> {
        self.users
            .iter()
            .map(|r| User {
                id: r.id.clone(),
                username: r.username.clone(),
                display_name: r.display_name.clone(),
                role: r.role.clone(),
                active: r.active,
                created_at: r.created_at,
            })
            .collect()
    }

    pub fn create_user(&self, user: User) -> User {
        self.users.insert(user.id.clone(), user.clone());
        user
    }

    pub fn delete_user(&self, user_id: &str) -> Result<(), String> {
        self.users.remove(user_id);
        Ok(())
    }

    pub fn create_session(&self, session: Session) -> Session {
        self.sessions.insert(session.session_id.clone(), session.clone());
        session
    }

    pub fn list_sessions(&self, user_id: &str) -> Vec<Session> {
        self.sessions
            .iter()
            .filter(|s| s.user_id == user_id)
            .map(|r| Session {
                session_id: r.session_id.clone(),
                user_id: r.user_id.clone(),
                started_at: r.started_at,
                last_activity: r.last_activity,
                device: r.device.clone(),
            })
            .collect()
    }

    pub fn terminate_session(&self, session_id: &str) -> Result<(), String> {
        self.sessions.remove(session_id);
        Ok(())
    }
}

impl Clone for User {
    fn clone(&self) -> Self {
        User {
            id: self.id.clone(),
            username: self.username.clone(),
            display_name: self.display_name.clone(),
            role: self.role.clone(),
            active: self.active,
            created_at: self.created_at,
        }
    }
}

impl Clone for Session {
    fn clone(&self) -> Self {
        Session {
            session_id: self.session_id.clone(),
            user_id: self.user_id.clone(),
            started_at: self.started_at,
            last_activity: self.last_activity,
            device: self.device.clone(),
        }
    }
}
