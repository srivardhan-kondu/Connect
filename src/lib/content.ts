/**
 * List copy shared by the home page sections and the chat assistant's system
 * prompt. Keeping one source means the assistant can't describe a framework,
 * value, or possibility that the page no longer shows.
 */

export const IDEAS = [
  {
    tone: "gold",
    title: "Connect",
    text: "Create meaningful relationships and trusted networks.",
  },
  {
    tone: "green",
    title: "Collaborate",
    text: "Unlock opportunities through collective growth.",
  },
  {
    tone: "blue",
    title: "Engage",
    text: "Participate in events, conversations, and initiatives that matter.",
  },
  {
    tone: "red",
    title: "Expand",
    text: "Grow beyond geographical boundaries and create lasting impact.",
  },
] as const;

export const REASONS = [
  {
    tone: "blue",
    title: "Trust",
    text: "Built around transparency, authenticity, and meaningful interactions.",
  },
  {
    tone: "gold",
    title: "Opportunity",
    text: "Helping communities discover people, ideas, and possibilities.",
  },
  {
    tone: "green",
    title: "Inclusion",
    text: "Designed for diverse communities and future generations.",
  },
  {
    tone: "red",
    title: "Growth",
    text: "Empowering individuals, organizations, and communities to thrive together.",
  },
  {
    tone: "blue",
    title: "Collaboration",
    text: "Creating spaces where collective success becomes possible.",
  },
  {
    tone: "gold",
    title: "Impact",
    text: "Turning connections into meaningful outcomes.",
  },
] as const;

export const CLAIMS = [
  { tone: "gold", text: "They create businesses." },
  { tone: "green", text: "They support families." },
  { tone: "blue", text: "They nurture talent." },
  { tone: "red", text: "They preserve culture." },
  { tone: "gold", text: "They inspire change." },
] as const;

export const POSSIBILITIES = [
  { tone: "gold", text: "Community Networks" },
  { tone: "green", text: "Professional Connections" },
  { tone: "blue", text: "Events & Gatherings" },
  { tone: "red", text: "Learning & Growth" },
  { tone: "green", text: "Local Ecosystems" },
  { tone: "blue", text: "Global Collaboration" },
  { tone: "red", text: "Support Systems" },
  { tone: "gold", text: "Meaningful Relationships" },
] as const;
