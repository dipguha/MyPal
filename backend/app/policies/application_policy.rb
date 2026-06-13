# Base Pundit policy. The actor is always the current member (see
# ApplicationController#pundit_user), never the user. ADR-002.
class ApplicationPolicy
  attr_reader :current_member, :record

  def initialize(current_member, record)
    raise Pundit::NotAuthorizedError, 'Must be logged in' unless current_member

    @current_member = current_member
    @record = record
  end

  # Most tables carry account_id directly; resolve it for scope checks.
  def record_account_id
    record.is_a?(Class) ? nil : record.account_id
  end

  def same_account?
    record_account_id == current_member.account_id
  end

  class Scope
    attr_reader :current_member, :scope

    def initialize(current_member, scope)
      @current_member = current_member
      @scope = scope
    end

    def resolve
      scope.where(account_id: current_member.account_id)
    end
  end
end
