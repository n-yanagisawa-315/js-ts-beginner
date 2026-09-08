export function TalkAvatar({
  speaker,
}: {
  speaker: "engineer" | "beginner";
}) {
  return speaker === "engineer" ? <MentorAvatar /> : <LearnerAvatar />;
}

function MentorAvatar() {
  return (
    <svg viewBox="0 0 64 64" className="talk-avatar" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#ffd57a" />
      <path
        d="M17 29c-3-10 3-19 15-19s18 9 15 19"
        fill="#f7efe0"
        stroke="#e8dcc8"
        strokeWidth="2"
      />
      <circle cx="17" cy="27" r="7" fill="#f7efe0" />
      <circle cx="47" cy="27" r="7" fill="#f7efe0" />
      <path d="M19 29c1-9 6-14 13-14s12 5 13 14v11c0 8-6 14-13 14S19 48 19 40Z" fill="#f2b98f" />
      <path d="M24 30c2-3 5-5 8-5s6 2 8 5" fill="none" stroke="#d99a73" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="35" r="4.5" fill="#fff7ec" stroke="#9a6f5d" strokeWidth="1.5" />
      <circle cx="38" cy="35" r="4.5" fill="#fff7ec" stroke="#9a6f5d" strokeWidth="1.5" />
      <path d="M30.5 35h3" stroke="#9a6f5d" strokeWidth="1.5" />
      <circle cx="27" cy="35" r="1.3" fill="#4e403a" />
      <circle cx="37" cy="35" r="1.3" fill="#4e403a" />
      <path d="M27 44c3 2.5 7 2.5 10 0" fill="none" stroke="#a85f62" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 56c3-6 8-9 15-9s12 3 15 9" fill="#f2f7f2" />
      <path d="m27 48 5 6 5-6" fill="#73b69f" />
    </svg>
  );
}

function LearnerAvatar() {
  return (
    <svg viewBox="0 0 64 64" className="talk-avatar" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#69c58a" />
      <path d="M12 35C12 18 21 8 32 8s20 10 20 27v17H12Z" fill="#6958aa" />
      <path d="M16 29c3-11 9-17 16-17s13 6 16 17" fill="#58bd7e" />
      <path d="M19 30c2-8 7-12 13-12s11 4 13 12v10c0 8-6 14-13 14S19 48 19 40Z" fill="#efb68a" />
      <path d="M18 31c3-2 5-5 6-9 5 5 12 7 21 7" fill="#5b4c98" />
      <circle cx="26" cy="36" r="1.7" fill="#443b3a" />
      <circle cx="38" cy="36" r="1.7" fill="#443b3a" />
      <path d="M28 44c2.5 1.8 5.5 1.8 8 0" fill="none" stroke="#a85f62" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 57c4-7 10-10 18-10s14 3 18 10" fill="#51448b" />
      <path d="M24 51h16l-2 8H26Z" fill="#dfeff1" />
      <circle cx="32" cy="55" r="1.4" fill="#72b9c4" />
    </svg>
  );
}
