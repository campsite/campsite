# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end

  def create_oauth_access_grant?
    @user == @record
  end

  def create_organization?
    confirmed_user?
  end

  def create_notification?
    confirmed_user?
  end

  def update_notification?
    confirmed_user?
  end

  def create_plugin?
    confirmed_user?
  end

  def create_editor_sync?
    confirmed_user?
  end

  def create_feedback?
    confirmed_user?
  end

  def create_figma_integration?
    confirmed_user?
  end

  def show_figma_integration?
    confirmed_user?
  end

  def reorder_memberships?
    confirmed_user?
  end

  def pause_notifications?
    confirmed_user?
  end

  def unpause_notifications?
    confirmed_user?
  end

  def show_notification_schedule?
    confirmed_user?
  end

  def update_notification_schedule?
    confirmed_user?
  end

  def destroy_notification_schedule?
    confirmed_user?
  end
end
