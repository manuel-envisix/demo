create table if not exists stage_state (
  id integer primary key,
  mode text not null default 'idle',
  armed_at timestamptz,
  cue jsonb,
  replay integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint stage_state_mode check (mode in ('idle', 'armed', 'live'))
);

insert into stage_state (id, mode)
values (1, 'idle')
on conflict (id) do nothing;
