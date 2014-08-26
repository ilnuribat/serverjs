#include <stdio.h>

int main() 
{
  freopen("data.txt", "r", stdin);
  freopen("data.out", "w", stdout);
  int hour, minute, second;
  for(int i = 0; i < 365; i++)
  {
    for(int j = 0; j < 6; j ++)
    {
      scanf("%d%d%d", &hour, &minute, &second);
      //cin >> hour >> minute >> second;
      printf("%d:%d\t", hour, minute);
    }
    printf("\n");
  }
	return 0;
}
