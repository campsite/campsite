# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :actor, :user, :record

  def initialize(actor, record)
    # We override `pundit_user` in our BaseControllers to be an ApiActor, but we have many Pundit.policy!(user, record)
    # calls in the codebase that pass in a User instance. This instance check helps us support both.
    # Here's the discussion where decided against replacing this instance check:
    # https://linear.app/campsite/issue/CAM-9999/update-punditpolicy-to-use-actors
    @actor = actor.is_a?(ApiActor) ? actor : ApiActor.new(user: actor)

    @user = @actor.user
    @record = record
  end

  def confirmed_user?
    !!@actor.confirmed?
  end

  class Scope
    def initialize(actor, scope)
      @actor = actor.is_a?(ApiActor) ? actor : ApiActor.new(user: actor)
      @user = @actor.user
      @scope = scope
    end

    def resolve
      raise NotImplementedError, "You must define #resolve in #{self.class}"
    end

    private

    attr_reader :actor, :user, :scope
  end
end
