# frozen_string_literal: true

class FlipperAuditLog < ApplicationRecord
  belongs_to :user, optional: true

  def accessory
    return "🗑️" if remove?
    return "✅" if fully_enable?
    return "❌" if fully_disable?
    return "👥" if enable_group? || disable_group? || enable_percentage_of_actors? || enable_percentage_of_time?
    return "💼" if enable_organization? || disable_organization?
    return "👤" if enable_user? || disable_user? || enable_actor? || disable_actor?

    "🚩"
  end

  def action
    return "added" if add?
    return "removed" if remove?
    return "enabled" if enable?
    return "disabled" if disable?

    raise "Unknown action"
  end

  def target_display_name
    return "everyone" if boolean_gate?
    return thing_name || thing_value if actor_gate?
    return thing_value if group_gate?
    return "#{thing_value}% of users" if percentage_of_actors_gate?

    "#{thing_value}% of time" if percentage_of_time_gate?
  end

  def user_display_name
    user&.display_name || "Someone"
  end

  def rollback_to!
    restore_boolean_gate!
    restore_actor_gate!
    restore_group_gate!
    restore_percentage_of_actors_gate!
    restore_percentage_of_time_gate!
  end

  private

  def feature
    Flipper.feature(feature_name)
  end

  def thing_value
    thing&.dig("value")
  end

  def thing_name
    thing&.dig("actor", "name") || thing&.dig("thing", "name")
  end

  def fully_enable?
    enable? && boolean_gate?
  end

  def fully_disable?
    disable? && boolean_gate?
  end

  def enable_group?
    enable? && group_gate?
  end

  def disable_group?
    disable? && group_gate?
  end

  def enable_organization?
    enable? && organization_gate?
  end

  def disable_organization?
    disable? && organization_gate?
  end

  def enable_user?
    enable? && user_gate?
  end

  def disable_user?
    disable? && user_gate?
  end

  def enable_actor?
    enable? && actor_gate?
  end

  def disable_actor?
    disable? && actor_gate?
  end

  def enable_percentage_of_actors?
    enable? && percentage_of_actors_gate?
  end

  def enable_percentage_of_time?
    enable? && percentage_of_time_gate?
  end

  def add?
    operation == "add"
  end

  def remove?
    operation == "remove"
  end

  def enable?
    operation == "enable"
  end

  def disable?
    operation == "disable"
  end

  def boolean_gate?
    return false unless gate_name

    gate_name == "boolean"
  end

  def group_gate?
    return false unless gate_name

    gate_name == "group"
  end

  def actor_gate?
    return false unless gate_name

    gate_name == "actor"
  end

  def organization_gate?
    return false unless thing_value

    actor_gate? && thing_value.starts_with?("Organization")
  end

  def user_gate?
    return false unless thing_value

    actor_gate? && thing_value.starts_with?("User")
  end

  def percentage_of_actors_gate?
    return false unless gate_name

    gate_name == "percentage_of_actors"
  end

  def percentage_of_time_gate?
    return false unless gate_name

    gate_name == "percentage_of_time"
  end

  def restore_boolean_gate!
    return feature.enable if gate_values_snapshot["boolean"] == true && !feature.enabled?

    feature.disable if gate_values_snapshot["boolean"] == false && feature.enabled?
  end

  def restore_actor_gate!
    (gate_values_snapshot["actors"] - feature.actors_value.to_a).each do |actor_value|
      feature.enable_actor(actor_from_actor_value(actor_value))
    end

    (feature.actors_value.to_a - gate_values_snapshot["actors"]).each do |actor_value|
      feature.disable_actor(actor_from_actor_value(actor_value))
    end
  end

  def actor_from_actor_value(actor_value)
    model_name, id = actor_value.split(";")
    model = model_name.constantize
    model.find_by(id: id) || Flipper::Actor.new(actor_value)
  end

  def restore_group_gate!
    (gate_values_snapshot["groups"] - feature.groups_value.to_a).each do |group|
      feature.enable_group(group)
    end

    (feature.groups_value.to_a - gate_values_snapshot["groups"]).each do |group|
      feature.disable_group(group)
    end
  end

  def restore_percentage_of_actors_gate!
    if feature.percentage_of_time_value != gate_values_snapshot["percentage_of_time"]
      feature.enable_percentage_of_time(gate_values_snapshot["percentage_of_time"])
    end
  end

  def restore_percentage_of_time_gate!
    if feature.percentage_of_actors_value != gate_values_snapshot["percentage_of_actors"]
      feature.enable_percentage_of_actors(gate_values_snapshot["percentage_of_actors"])
    end
  end
end
