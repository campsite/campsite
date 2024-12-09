# frozen_string_literal: true

# config/initializers/flipper.rb
Rails.application.configure do
  config.flipper.preload = false
end

Flipper.register(:staff) do |actor, _context|
  actor.respond_to?(:staff?) && actor.staff?
end

Flipper.register(:demo_orgs) do |actor, _context|
  actor.respond_to?(:demo) && actor.demo?
end

Flipper.register(:logged_out) do |actor, _context|
  actor.flipper_id == User::NullUser::FLIPPER_ID
end

# https://www.flippercloud.io/docs/instrumentation
ActiveSupport::Notifications.subscribe("feature_operation.flipper") do |event|
  if event.payload[:operation].in?([:enable, :disable, :add, :remove])
    FlipperAuditLog.create!(
      user_id: Current.user&.id,
      feature_name: event.payload[:feature_name],
      operation: event.payload[:operation],
      gate_name: event.payload[:gate_name],
      thing: event.payload[:thing],
      result: event.payload[:result],
      gate_values_snapshot: Flipper.feature(event.payload[:feature_name]).gate_values,
    )
  end
end
