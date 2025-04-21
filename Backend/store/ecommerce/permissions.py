from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to view/edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow administrators
        if request.user.is_staff:
            return True
            
        # Check if the object has a user attribute that matches the request user
        return hasattr(obj, 'user') and obj.user == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to create/edit/delete objects,
    but allow anyone to view them.
    """
    
    def has_permission(self, request, view):
        # Allow all read-only requests
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Allow write permissions only to administrators
        return request.user and request.user.is_staff