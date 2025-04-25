from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import Category, Product, Order, OrderItem, OrderStatus
from .serializers import CategorySerializer, ProductSerializer, OrderItemSerializer, OrderSerializer, OrderStatusSerializer,UserSerializer
from rest_framework.response import Response
from rest_framework import status, serializers
from django.shortcuts import get_object_or_404
from django.db import transaction


# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_admin_status(request):
    user = request.user
    return Response({
        'is_admin': user.is_staff or user.is_superuser
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products,many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Only admin users can create products
        if not request.user.is_staff:
            return Response(
                {"error": "You don't have permission to create products"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """
    Retrieve, update or delete a product
    """
    product = get_object_or_404(Product, pk=pk)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    # Only admin users can update or delete products
    if not request.user.is_staff:
        return Response(
            {"error": "You don't have permission to modify products"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



# Class-Based Views (CBV)
class CategoryList(APIView):
    """
    List all categories or create a new category
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response(
                {"error": "You don't have permission to create categories"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items', 'items__product')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Additional CBV for CRUD operations on Order
class OrderDetail(APIView):
    """
    Retrieve, update or delete an order
    """
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        order = get_object_or_404(Order, pk=pk)
        # Check if the user has permission to access this order
        if not user.is_staff and order.user != user:
            raise PermissionError("You don't have permission to access this order")
        return order
    
    def get(self, request, pk):
        try:
            order = self.get_object(pk, request.user)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
    
    def put(self, request, pk):
        try:
            order = self.get_object(pk, request.user)
            serializer = OrderSerializer(order, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
    
    def delete(self, request, pk):
        try:
            order = self.get_object(pk, request.user)
            order.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    user = request.user
    if user.is_staff:  # or user.is_superuser or custom admin check
        orders = Order.objects.all()
    else:
        orders = Order.objects.filter(user=user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)