# frozen_string_literal: true

class AttachmentPolicy < ApplicationPolicy
  def show?
    @record.subject.nil? || Pundit.policy!(user, @record.subject).show_attachments?
  end
end
