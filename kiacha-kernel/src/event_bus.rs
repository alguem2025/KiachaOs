use tokio::sync::broadcast;
use dashmap::DashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Event {
    pub event_type: String,
    pub source: String,
    pub payload: Vec<u8>,
    pub timestamp: i64,
}

pub struct EventBus {
    channels: Arc<DashMap<String, broadcast::Sender<Event>>>,
}

impl EventBus {
    pub fn new() -> Self {
        EventBus {
            channels: Arc::new(DashMap::new()),
        }
    }

    /// Subscribe to events of a specific type
    pub fn subscribe(&self, event_type: String) -> broadcast::Receiver<Event> {
        let entry = self.channels.entry(event_type.clone());
        let sender = entry.or_insert_with(|| {
            let (sender, _) = broadcast::channel(100);
            sender
        });
        sender.subscribe()
    }

    /// Publish an event
    pub async fn publish(&self, event: Event) -> anyhow::Result<()> {
        if let Some(sender) = self.channels.get(&event.event_type) {
            sender.send(event)?;
        }
        Ok(())
    }

    /// List all active subscriptions
    pub fn get_subscriptions(&self) -> Vec<String> {
        self.channels.iter().map(|r| r.key().clone()).collect()
    }
}
